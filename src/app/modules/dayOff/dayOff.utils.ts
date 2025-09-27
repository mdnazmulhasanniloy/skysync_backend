import { PipelineStage, Types } from 'mongoose';
import pickQuery from '../../utils/pickQuery';
import moment from 'moment';
import { paginationHelper } from '../../helpers/pagination.helpers';
import DayOff from './dayOff.models';

interface IResponse {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
export const getAllDayOff = async (
  query: Record<string, any>,
): Promise<IResponse> => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, schedulePeriod, ...filtersData } = filters;

  if (filtersData?.author) {
    filtersData['user'] = new Types.ObjectId(filtersData?.user);
  }

  const pipeline: PipelineStage[] = [];

  pipeline.push({
    $match: {
      isDeleted: false,
    },
  });

  if (schedulePeriod) {
    const startOfDay = moment(schedulePeriod).startOf('day').utc().toDate();
    const endOfDay = moment(schedulePeriod).endOf('day').utc().toDate();

    pipeline.push({
      $match: {
        schedulePeriod: {
          $get: startOfDay,
          $let: endOfDay,
        },
      },
    });
  }

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: ['name', 'Other', 'address'].map(field => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        })),
      },
    });
  }

  if (Object.entries(filtersData).length) {
    Object.entries(filtersData).forEach(([field, value]) => {
      if (/^\[.*?\]$/.test(value)) {
        const match = value.match(/\[(.*?)\]/);
        const queryValue = match ? match[1] : value;
        pipeline.push({
          $match: {
            [field]: { $in: [new Types.ObjectId(queryValue)] },
          },
        });
        delete filtersData[field];
      } else {
        // 🔁 Convert to number if numeric string
        if (!isNaN(value)) {
          filtersData[field] = Number(value);
        }
      }
    });

    if (Object.entries(filtersData).length) {
      pipeline.push({
        $match: {
          $and: Object.entries(filtersData).map(([field, value]) => ({
            isDeleted: false,
            [field]: value,
          })),
        },
      });
    }
  }

  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('-')) {
        return { [trimmedField.slice(1)]: -1 };
      }
      return { [trimmedField]: 1 };
    });

    pipeline.push({ $sort: Object.assign({}, ...sortArray) });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        // Lookups
        {
          $lookup: {
            from: 'user',
            localField: 'author',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  id: 1,
                  _id: 1,
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                  profile: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] },
          },
        },
      ],
    },
  });
  const [result] = await DayOff.aggregate(pipeline);

  const total = result?.totalData?.[0]?.total || 0;
  const data = result?.paginatedData || [];

  const response = {
    meta: { page, limit, total },
    data,
  };

  return response;
};
