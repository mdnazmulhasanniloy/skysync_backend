import moment from 'moment';
import Flight from '../flight/flight.models';
import Standby from '../standby/standby.models';
import Dnd from '../dnd/dnd.models';
import DayOff from '../dayOff/dayOff.models';
import now from '../../utils/now';
import { IDayOff } from '../dayOff/dayOff.interface';
import pickQuery from '../../utils/pickQuery';
import { User } from '../user/user.models';
import { Types } from 'mongoose';
import { paginationHelper } from '../../helpers/pagination.helpers';

// export const getMySchedule = async (query: Record<string, any>) => {
//   const { userId, month, year } = query;
//   const startOfMonth =
//     year && month
//       ? now(
//           moment()
//             .year(year)
//             .month(month - 1),
//         )
//           .startOf('month')
//           .toDate()
//       : now().startOf('month').toDate();

//   const endOfMonth =
//     year && month
//       ? now(
//           moment()
//             .year(year)
//             .month(month - 1),
//         )
//           .endOf('month')
//           .toDate()
//       : now().endOf('month').toDate();

//   // 📅 Build daily schedule object
//   const schedule: Record<
//     string,
//     {
//       flights: any[];
//       standbys: any[];
//       dnds: any[];
//       offdays: any[];
//     }
//   > = {};

//   const flights = await Flight.find({
//     user: userId,
//     isDeleted: false,
//     $or: [
//       {
//         'schedulePeriod.startAt': {
//           $gte: startOfMonth.toISOString(),
//           $lte: endOfMonth.toISOString(),
//         },
//       },
//       {
//         'schedulePeriod.endAt': {
//           $gte: startOfMonth.toISOString(),
//           $lte: endOfMonth.toISOString(),
//         },
//       },
//     ],
//   });

//   if (flights) {
//     flights.forEach(f => {
//       const start = moment(f.schedulePeriod.startAt);
//       const end = moment(f.schedulePeriod.endAt);
//       const current = start.clone();

//       while (current.isSameOrBefore(end, 'day')) {
//         const key = current.format('YYYY-MM-DD');
//         if (!schedule[key])
//           schedule[key] = { flights: [], standbys: [], dnds: [], offdays: [] };
//         schedule[key].flights.push(f);
//         current.add(1, 'day');
//       }
//     });
//   }

//   const standbys = await Standby.find({
//     user: userId,
//     isDeleted: false,
//     date: {
//       $gte: startOfMonth.toISOString(),
//       $lte: endOfMonth.toISOString(),
//     },
//   });

//   if (standbys) {
//     standbys.forEach(s => {
//       const key = moment(s.date).format('YYYY-MM-DD');
//       if (!schedule[key])
//         schedule[key] = { flights: [], standbys: [], dnds: [], offdays: [] };
//       schedule[key].standbys.push(s);
//     });
//   }

//   const dnds = await Dnd.find({
//     user: userId,
//     isDeleted: false,
//     date: {
//       $gte: startOfMonth.toISOString(),
//       $lte: endOfMonth.toISOString(),
//     },
//   });

//   if (dnds) {
//     dnds.forEach(d => {
//       const key = moment(d.date).format('YYYY-MM-DD');
//       if (!schedule[key])
//         schedule[key] = { flights: [], standbys: [], dnds: [], offdays: [] };
//       schedule[key].dnds.push(d);
//     });
//   }

//   const offdays = await DayOff.find({
//     user: userId,
//     isDeleted: false,
//     schedulePeriod: {
//       $gte: startOfMonth.toISOString(),
//       $lte: endOfMonth.toISOString(),
//     },
//   });

//   if (offdays) {
//     offdays.forEach((o: IDayOff) => {
//       const start = moment(o.schedulePeriod);
//       const end = moment(o.schedulePeriod);
//       const current = start.clone();

//       while (current.isSameOrBefore(end, 'day')) {
//         const key = current.format('YYYY-MM-DD');
//         if (!schedule[key])
//           schedule[key] = { flights: [], standbys: [], dnds: [], offdays: [] };
//         schedule[key].offdays.push(o);
//         current.add(1, 'day');
//       }
//     });
//   }

//   return schedule;
// };

export const getMySchedule = async (query: Record<string, any>) => {
  const { userId, month, year } = query;
  const startOfMonth =
    year && month
      ? now(
          moment()
            .year(year)
            .month(month - 1),
        )
          .startOf('month')
          .toDate()
      : now().startOf('month').toDate();

  const endOfMonth =
    year && month
      ? now(
          moment()
            .year(year)
            .month(month - 1),
        )
          .endOf('month')
          .toDate()
      : now().endOf('month').toDate();

  // 📅 Create an empty array to hold the schedule data
  const schedule: any[] = [];

  // Fetch flights
  const flights = await Flight.find({
    user: userId,
    isDeleted: false,
    $or: [
      {
        'schedulePeriod.startAt': {
          $gte: startOfMonth.toISOString(),
          $lte: endOfMonth.toISOString(),
        },
      },
      {
        'schedulePeriod.endAt': {
          $gte: startOfMonth.toISOString(),
          $lte: endOfMonth.toISOString(),
        },
      },
    ],
  });

  // Process flights and group them by date
  if (flights) {
    flights.forEach(f => {
      const start = moment(f.schedulePeriod.startAt);
      const end = moment(f.schedulePeriod.endAt);
      const current = start.clone();

      while (current.isSameOrBefore(end, 'day')) {
        const date = current.format('YYYY-MM-DD');
        const existingSchedule = schedule.find(s => s.date === date);

        if (!existingSchedule) {
          schedule.push({
            date,
            flights: [f],
            standbys: [],
            dnds: [],
            offdays: [],
          });
        } else {
          existingSchedule.flights.push(f);
        }
        current.add(1, 'day');
      }
    });
  }

  // Fetch standbys
  const standbys = await Standby.find({
    user: userId,
    isDeleted: false,
    date: {
      $gte: startOfMonth.toISOString(),
      $lte: endOfMonth.toISOString(),
    },
  });

  // Process standbys and add to the corresponding date
  if (standbys) {
    standbys.forEach(s => {
      const date = moment(s.date).format('YYYY-MM-DD');
      const existingSchedule = schedule.find(sch => sch.date === date);

      if (!existingSchedule) {
        schedule.push({
          date,
          flights: [],
          standbys: [s],
          dnds: [],
          offdays: [],
        });
      } else {
        existingSchedule.standbys.push(s);
      }
    });
  }

  // Fetch dnds (Do not disturb)
  const dnds = await Dnd.find({
    user: userId,
    isDeleted: false,
    date: {
      $gte: startOfMonth.toISOString(),
      $lte: endOfMonth.toISOString(),
    },
  });

  // Process dnds and add to the corresponding date
  if (dnds) {
    dnds.forEach(d => {
      const date = moment(d.date).format('YYYY-MM-DD');
      const existingSchedule = schedule.find(sch => sch.date === date);

      if (!existingSchedule) {
        schedule.push({
          date,
          flights: [],
          standbys: [],
          dnds: [d],
          offdays: [],
        });
      } else {
        existingSchedule.dnds.push(d);
      }
    });
  }

  // Fetch offdays
  const offdays = await DayOff.find({
    user: userId,
    isDeleted: false,
    schedulePeriod: {
      $gte: startOfMonth.toISOString(),
      $lte: endOfMonth.toISOString(),
    },
  });

  // Process offdays and add to the corresponding date
  if (offdays) {
    offdays.forEach(o => {
      const start = moment(o.schedulePeriod);
      const end = moment(o.schedulePeriod);
      const current = start.clone();

      while (current.isSameOrBefore(end, 'day')) {
        const date = current.format('YYYY-MM-DD');
        const existingSchedule = schedule.find(sch => sch.date === date);

        if (!existingSchedule) {
          schedule.push({
            date,
            flights: [],
            standbys: [],
            dnds: [],
            offdays: [o],
          });
        } else {
          existingSchedule.offdays.push(o);
        }
        current.add(1, 'day');
      }
    });
  }

  return schedule;
};

const standByFilter = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, lookingFor, fleets, ...filtersData } = filters;

  const pipeline = [];

  pipeline.push({ $match: { isDeleted: false } });
  // if (lookingFor) {
  //   const startAt = now(moment(lookingFor).startOf('day')).toDate();
  //   const endAt = now(moment(lookingFor).endOf('day')).toDate();

  //   console.log(lookingFor);
  //   pipeline.push({
  //     $match: {
  //       date: {
  //         $gte: endAt,
  //         $lte: startAt,
  //       },
  //     },
  //   });
  // }

  if (lookingFor) {
    const startAt = moment(lookingFor).startOf('day').toDate();
    const endAt = moment(lookingFor).endOf('day').toDate();

    pipeline.push({
      $match: {
        date: {
          $gte: startAt,
          $lte: endAt,
        },
      },
    });
  }

  if (fleets) {
    const fleetsArr = JSON.parse(fleets);

    const userIdes = await User.aggregate([
      {
        $match: {
          fleet: { $in: fleetsArr },
        },
      },

      {
        $group: {
          _id: null,
          userIds: { $push: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          userIds: 1,
        },
      },
    ]).then(data => (data?.length > 0 ? data[0]?.userIds : []));
    console.log(userIdes);
    pipeline.push({
      $match: {
        user: {
          $in: userIdes,
        },
      },
    });
  }

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: ['name', 'othersFacilities'].map(field => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      },
    });
  }

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

  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmed = field.trim();
      return trimmed.startsWith('-')
        ? { [trimmed.slice(1)]: -1 }
        : { [trimmed]: 1 };
    });
    pipeline.push({ $sort: Object.assign({}, ...sortArray) });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  bio: 1,
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

  const [result] = await Standby.aggregate(pipeline);
  const total = result?.totalData?.[0]?.total || 0;
  const data = result?.paginatedData || [];

  return {
    meta: { page, limit, total },
    data,
  };
};

const dayOfFilter = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { date, fleets, searchTerm, ...filtersData } = filters;

  const pipeline = [];

  pipeline.push({ $match: { isDeleted: false } });

  if (date) {
    pipeline.push({
      $match: {
        schedulePeriod: {
          $gte: now(moment(date).startOf('day')).toDate(),
          $lte: now(moment(date).endOf('day')).toDate(),
        },
      },
    });
  }

  if (fleets) {
    const fleetsArr = JSON.parse(fleets);
    const userIdes = await User.aggregate([
      {
        $match: {
          fleet: { $in: fleetsArr },
        },
      },

      {
        $group: {
          _id: null,
          userIds: { $push: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          userIds: 1,
        },
      },
    ]).then(data => (data?.length > 0 ? data[0]?.userIds : []));

    pipeline.push({
      $match: {
        user: {
          $in: userIdes,
        },
      },
    });
  }

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [''].map(field => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      },
    });
  }

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

  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmed = field.trim();
      return trimmed.startsWith('-')
        ? { [trimmed.slice(1)]: -1 }
        : { [trimmed]: 1 };
    });
    pipeline.push({ $sort: Object.assign({}, ...sortArray) });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  bio: 1,
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

  return {
    meta: { page, limit, total },
    data,
  };
};

const flightFilter = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const {
    date,
    fleets,
    outOfFleets,
    flightNo,
    destination,
    searchTerm,
    ...filtersData
  } = filters;

  const pipeline = [];

  pipeline.push({ $match: { isDeleted: false } });

  if (date) {
    pipeline.push({
      $match: {
        'schedulePeriod.startAt': {
          $gte: now(moment(date).startOf('day')).toDate(),
          $lte: now(moment(date).endOf('day')).toDate(),
        },
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

  if (fleets) {
    const fleetsArr = JSON.parse(fleets);
    const userIdes = await User.aggregate([
      {
        $match: {
          fleet: { $in: fleetsArr },
        },
      },

      {
        $group: {
          _id: null,
          userIds: { $push: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          userIds: 1,
        },
      },
    ]).then(data => (data?.length > 0 ? data[0]?.userIds : []));

    pipeline.push({
      $match: {
        user: {
          $in: userIdes,
        },
      },
    });
  }
  if (outOfFleets) {
    const fleetsArr = JSON.parse(outOfFleets);
    const userIdes = await User.aggregate([
      {
        $match: {
          fleet: { $nin: fleetsArr },
        },
      },

      {
        $group: {
          _id: null,
          userIds: { $push: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          userIds: 1,
        },
      },
    ]).then(data => (data?.length > 0 ? data[0]?.userIds : []));

    pipeline.push({
      $match: {
        user: {
          $in: userIdes,
        },
      },
    });
  }
  //----------------------

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [''].map(field => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      },
    });
  }

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

  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmed = field.trim();
      return trimmed.startsWith('-')
        ? { [trimmed.slice(1)]: -1 }
        : { [trimmed]: 1 };
    });
    pipeline.push({ $sort: Object.assign({}, ...sortArray) });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  bio: 1,
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

  const [result] = await Flight.aggregate(pipeline);
  const total = result?.totalData?.[0]?.total || 0;
  const data = result?.paginatedData || [];

  return {
    meta: { page, limit, total },
    data,
  };
};

const dndFilter = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { date, fleets, searchTerm, ...filtersData } = filters;

  const pipeline = [];

  pipeline.push({ $match: { isDeleted: false } });

  if (date) {
    pipeline.push({
      $match: {
        date: {
          $gte: now(moment(date).startOf('day')).toDate(),
          $lte: now(moment(date).endOf('day')).toDate(),
        },
      },
    });
  }

  if (fleets) {
    const fleetsArr = JSON.parse(fleets);
    const userIdes = await User.aggregate([
      {
        $match: {
          fleet: { $in: fleetsArr },
        },
      },

      {
        $group: {
          _id: null,
          userIds: { $push: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          userIds: 1,
        },
      },
    ]).then(data => (data?.length > 0 ? data[0]?.userIds : []));

    pipeline.push({
      $match: {
        user: {
          $in: userIdes,
        },
      },
    });
  }

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [''].map(field => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      },
    });
  }

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

  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmed = field.trim();
      return trimmed.startsWith('-')
        ? { [trimmed.slice(1)]: -1 }
        : { [trimmed]: 1 };
    });
    pipeline.push({ $sort: Object.assign({}, ...sortArray) });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  bio: 1,
                  phoneNumber: 1,
                  profile: 1,
                },
              },
            ],
          },
        },

        {
          $addFields: {
            author: { $arrayElemAt: ['$user', 0] },
          },
        },
      ],
    },
  });

  const [result] = await Dnd.aggregate(pipeline);
  const total = result?.totalData?.[0]?.total || 0;
  const data = result?.paginatedData || [];

  return {
    meta: { page, limit, total },
    data,
  };
};

export const homeService = {
  getMySchedule,
  standByFilter,
  dayOfFilter,
  flightFilter,
  dndFilter,
};
