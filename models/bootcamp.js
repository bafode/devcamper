const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootCampShema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter your name"],
      trim: true,
      unique: true,
      maxlength: [50, "the name can not be more than 50 character"],
    },
    slug: String,
    description: {
      type: String,
      maxlength: [500, "the name can not be more than 500 character"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "please use a valid url with http or https",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "the phone number can not be more than 20 caracter"],
      /* match: [
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
        "please add a value email",
      ],*/ 
    },
    email: {
      type: String,
    },
    address: {
      type: String,
      // required: [true, "please enter your address"],
    },
    location: {
      //Geojson point
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        // required: true,
      },
      coordinates: {
        type: [Number],
        //required: true,
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      // required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Others",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "rating must be at least 1"],
      max: [10, "rating must be at more 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  //virtual attribute
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//create bootcamp slug from the name
BootCampShema.pre("save", function (next) {
  //console.log("slugify is run " + this.name);
  this.slug = slugify(this.name, { power: true });
  next();
});

//GEOCODER & CREATE LOCATION FIELD
BootCampShema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };
  //do not save address in the database
  this.address = undefined;
  next();
});
//cascade delete courses when the bootcamp is deleted from the database
BootCampShema.pre("remove", async function (next) {
  console.log("courses being removed from bootcamp " + this._id);
  await this.model("Course").deleteMany({ Bootcamp: this_id });
  next();
});

//reverse populate with virtuals
//field name will be courses
BootCampShema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

const Bootcamp = mongoose.model("Bootcamp", BootCampShema);

module.exports = Bootcamp;
