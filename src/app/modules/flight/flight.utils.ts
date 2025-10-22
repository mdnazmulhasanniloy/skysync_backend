import { PipelineStage, Types } from 'mongoose';
import { paginationHelper } from '../../helpers/pagination.helpers';
import Flight from './flight.models';
import moment from 'moment';
import pickQuery from '../../utils/pickQuery';
import { User } from '../user/user.models';

interface IResponse {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
export const getFlights = async (
  query: Record<string, any>,
): Promise<IResponse> => {
  const { filters, pagination } = await pickQuery(query);
  const {
    searchTerm,
    date,
    flightNo,
    fleet,
    fleetOut,
    destination,
    ...filtersData
  } = filters;

  if (filtersData?.author) {
    filtersData['user'] = new Types.ObjectId(filtersData?.user);
  }

  const pipeline: PipelineStage[] = [];

  pipeline.push({
    $match: {
      isDeleted: false,
    },
  });

  if (fleet) {
    const qur = fleet.split(',').map((num: string) => Number(num));

    const result = await User.aggregate([
      {
        $match: {
          fleet: { $in: qur },
        },
      },
      {
        $group: {
          _id: null,
          userIds: { $push: '$_id' },
        },
      },
    ]);

    const userIds = result[0]?.userIds || [];

    if (userIds.length) {
      pipeline.push({
        $match: {
          user: { $in: userIds },
        },
      });
    }
  }
  if (fleetOut) {
    const qur = fleetOut.split(',').map((num: string) => Number(num));

    const result = await User.aggregate([
      {
        $match: {
          fleet: { $nin: qur },
        },
      },
      {
        $group: {
          _id: null,
          userIds: { $push: '$_id' },
        },
      },
    ]);

    const userIds = result[0]?.userIds || [];

    if (userIds.length) {
      pipeline.push({
        $match: {
          user: { $in: userIds },
        },
      });
    }
  }

  if (date) {
    const startOfDay = moment(date).startOf('day').utc().toDate();
    const endOfDay = moment(date).endOf('day').utc().toDate();

    pipeline.push({
      $match: {
        'schedulePeriod.startAt': { $lte: endOfDay },
        'schedulePeriod.endAt': { $gte: startOfDay },
      },
    });
  }
  if (flightNo) {
    pipeline.push({
      $match: {
        $or: [
          { 'flightInformation.sq1': flightNo },
          { 'flightInformation.sq2': flightNo },
        ],
      },
    });
  }

  if (destination) {
    pipeline.push({
      $match: {
        'sector.to': destination,
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
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  verification: 0,
                  password: 0,
                  device: 0,
                  expireAt: 0,
                  isDeleted: 0,
                  passwordChangedAt: 0,
                  needsPasswordChange: 0,
                  loginWth: 0,
                  customerId: 0,
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
  const [result] = await Flight.aggregate(pipeline);

  const total = result?.totalData?.[0]?.total || 0;
  const data = result?.paginatedData || [];

  const response = {
    meta: { page, limit, total },
    data,
  };

  return response;
};
