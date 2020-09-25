const { populate } = require("../models/Course");

const advancedResults = (model, populate) => async (req, res, next) => {
  //console.log(req.query);
  //advanced fitring
  let query;

  //copy req.query
  const reqQuery = { ...req.query };

  //fields to execute
  const removeFields = ["select", "sort", "page", "limit"];

  //loop other removeFields and remove them from query
  removeFields.forEach((param) => delete reqQuery[param]);
  //console.log(reqQuery);

  //create query string
  let queryStr = JSON.stringify(reqQuery);

  //create operators ($gt,$gte,etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => "$" + match
  );
  console.log(queryStr);
  //finding ressources in the db
  //query = Bootcamp.find(JSON.parse(queryStr));
  query = model.find(JSON.parse(queryStr)); //virtual
  //query = model.find(JSON.parse(queryStr)).populate("courses"); //virtual
  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    //console.log(fields);
    query = query.select(fields);
  }

  //sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    //console.log(fields);
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  //const skip = (page - 1) * limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //execute ressources
  const results = await query;

  //pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResults;
