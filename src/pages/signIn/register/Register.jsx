"use client";

import {
  PronounSelector,
  BirthYearSelector,
  BirthMonthSelector,
  NICGenderSelector,
  ALStreamSelector,
  AcademicYearSelector,
  MediumSelector,
} from "./DropDownSelect";
import Districtselect from "./DistrictSelect";
import { capitalizeFirstLetter } from "@/pages/paperPractice/AttemptSummary/AnalyticsFunctions";
import {
  callRegisterFunction,
  checkUserSensitiveInfoExists,
} from "./RegisterFucntions";

import { auth } from "@/firebase";
import { httpsCallable } from "firebase/functions";

import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { IoMdArrowRoundBack } from "react-icons/io";
import { IoChevronBackOutline } from "react-icons/io5";
import { SlInfo } from "react-icons/sl";
import "./register.css";
import ErrorWithOllie from "@/components/ErrorWithOllie/ErrorWithOllie";
import { useNavigate } from "react-router-dom";

import floatingLearningObjects from "../../../assets/img/objects/floating-objects.png"

export default function RegisterPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState({
    submitting: false,
    toastsubID: null,
    sensitiveInfoLoading: true,
    sensitiveDataExists: null,
  });

  //get user info
  const user = auth.currentUser;
  useEffect(() => {
    if (!user) {
      // redirect("/log-in"); // Redirect to login if not authenticated
      navigate("/log-in");
    }
    console.log(user);
  }, [user]);

  //check if they already have registered
  useEffect(() => {
    const checkSensitiveInfo = async () => {
      const sensitiveInfoExists = await checkUserSensitiveInfoExists(auth);
      setLoading((prev) => ({
        ...prev,
        sensitiveInfoLoading: false,
        sensitiveDataExists: sensitiveInfoExists,
      }));
    };
    checkSensitiveInfo();
  }, []);

  const schema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    pronoun: yup.string().required("Pronoun is required"),
    streetAddress: yup.string(),
    city: yup.string().required("City is required"),
    district: yup.string().required("District is required"),
    postalCode: yup.string(),
    birthYear: yup
      .number()
      .required("Birth year is required")
      .min(1900, "Invalid year")
      .max(new Date().getFullYear(), "Invalid year"),
    birthMonth: yup
      .number()
      .required("Birth month is required")
      .min(1, "Invalid month")
      .max(12, "Invalid month"),
    birthDay: yup
      .number()
      .required("Birth day is required")
      .typeError("Birth day must be a number")
      .min(1, "Invalid day")
      .when("birthMonth", (birthMonth, schema) => {
        if (parseInt(birthMonth) === 2) {
          return schema.max(29, "Invalid day for February");
        } else if ([4, 6, 9, 11].includes(parseInt(birthMonth))) {
          return schema.max(30, "Invalid day for the selected month");
        } else {
          return schema.max(31, "Invalid day");
        }
      }),
    gender: yup.string().required("Gender is required"),
    nicNumber: yup
      .string()
      .required("NIC number is required")
      .test(
        "nic-validation",
        `The NIC number does not match the provided birth date or gender. Ensure the birth date and gender align with the information on your NIC.`,
        function (value) {
          const { birthYear, birthMonth, birthDay, gender } = this.parent;
          return validateNIC(value, birthYear, birthMonth, birthDay, gender);
        }
      ),
    alStream: yup.string().required("AL stream is required"),
    academicYear: yup
      .number()
      .required("Academic year is required")
      .min(1900, "Invalid year")
      .max(2028, "Invalid year"),
    medium: yup.string().required("Medium is required"),
    challengingUnits: yup.object().shape({
      networking: yup.boolean(),
      dbms: yup.boolean(),
      systemAnalysis: yup.boolean(),
      programming: yup.boolean(),
      numberSystems: yup.boolean(),
      webDevelopment: yup.boolean(),
      other: yup.boolean(),
    }),
  });

  //Nic validation
  const validateNIC = (nicNumber, birthYear, birthMonth, birthDay, gender) => {
    const extractedData = extractDataFromNIC(nicNumber);

    if (!extractedData) return false;

    // Cross-check year, month, day, and gender from NIC with the user's input
    return (
      extractedData.year == birthYear &&
      extractedData.month == birthMonth &&
      extractedData.day == birthDay &&
      extractedData.gender.toLowerCase() === gender.toLowerCase()
    );
  };

  const extractDataFromNIC = (nicNumber) => {
    let year, dayList, gender;
    nicNumber = nicNumber.trim();

    if (nicNumber.length === 10) {
      year = "19" + nicNumber.substr(0, 2); // assumes 1900s
      dayList = parseInt(nicNumber.substr(2, 3));
      gender = dayList > 500 ? "Female" : "Male";
      dayList = dayList > 500 ? dayList - 500 : dayList;
    } else if (nicNumber.length === 12) {
      year = nicNumber.substr(0, 4);
      dayList = parseInt(nicNumber.substr(4, 3));
      gender = dayList > 500 ? "Female" : "Male";
      dayList = dayList > 500 ? dayList - 500 : dayList;
    } else {
      return null; // Invalid NIC
    }

    // Calculate the month and day based on the day count
    const { month, day } = calculateMonthAndDay(dayList);
    return { year, month, day, gender };
  };

  const calculateMonthAndDay = (days) => {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let month = 0;
    let day = days;

    while (month < 12 && day > daysInMonth[month]) {
      day -= daysInMonth[month];
      month++;
    }

    return { month: month + 1, day };
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue, // Used to update values programmatically
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
    const storeData = async (data) => {
      const toastSubId = toast.loading("Submitting your data...");
      setLoading((prev) => ({
        ...prev,
        submitting: true,
        toastsubID: toastSubId,
      }));
      try {
        await callRegisterFunction(data);
        toast.success(
          "Data submitted successfully. You'll be redirected to dashboard.",
          { id: toastSubId }
        );
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Error submitting data", error);
        toast.error(`Error submitting data. ${error}`, { id: toastSubId });
        setLoading((prev) => ({ ...prev, submitting: false }));
      } finally {
      }
    };
    storeData(data);
  };

  if (user && loading.sensitiveInfoLoading) {
    return (
      <div className="def-holder">
        <div className="max-w-lg w-full flex flex-col items-center p-5">
          <div className="w-full">
            <button
              className="def-back-btn"
              onClick={() => {
                navigate("/");
              }}
            >
              <IoChevronBackOutline />
            </button>
          </div>
          <img
            src={user.photoURL}
            alt="profile pic"
            className="max-w-52 w-full rounded-full mt-6"
          />
          <div className="text-2xl mt-5 rounded-md p-1 px-2 max-w-full flex flex-col items-center *:max-w-full *:overflow-hidden *:text-nowrap *:text-ellipsis">
            <p>{user.displayName}</p>
            <p className="text-xs bg-slate-600 px-2 rounded-full text-white w-fit">
              {user.email}
            </p>
          </div>
          <ErrorWithOllie
            loading={true}
            loadingTitle="Checking Info"
            hideOllie={true}
          />
        </div>
      </div>
    );
  }
  if (
    user &&
    !loading.sensitiveInfoLoading &&
    loading.sensitiveDataExists != null &&
    loading.sensitiveDataExists
  ) {
    return (
      <div className="def-holder">
        <div className="max-w-lg w-full flex flex-col items-center p-5">
          <div className="w-full">
            <button
              className="def-back-btn"
              onClick={() => {
                navigate("/");
              }}
            >
              <IoChevronBackOutline />
            </button>
          </div>
          <img
            src={user.photoURL}
            alt="profile pic"
            className="max-w-52 w-full rounded-full mt-6"
          />
          <ErrorWithOllie
            loading={false}
            title="You are not welcome here. ¬_¬"
            hideOllie={true}
            redirectToHome={true}
          >
            You’re already registered, so there’s no need to sign up again. Just
            head back to the dashboard!
          </ErrorWithOllie>
        </div>
      </div>
    );
  }
  if (
    user &&
    !loading.sensitiveInfoLoading &&
    !loading.sensitiveDataExists &&
    loading.sensitiveDataExists != null
  ) {
    return (
      <div className="def-holder">
        <div className="def-child register-child">
          <div className="top">
            <button
              className="def-back-btn"
              onClick={() => {
                navigate("/");
              }}
            >
              <IoChevronBackOutline />
            </button>
            <div className="profile-and-logo">
              <img src="/main-logo.svg" alt="platform-logo" />
              {user && user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="user-profile"
                  className="h-12 w-12 rounded-full overflow-hidden"
                />
              ) : (
                <p>Loading...</p>
              )}
            </div>
            <div className="title">
              <div className="section-title">Tell Us More About You</div>
              <div className="email">{user.email}</div>
            </div>
            <img
              src={floatingLearningObjects}
              alt="floating learning objects"
              className="img-f-o"
            />
          </div>
          <div className="bottom">
            {!loading.submitting && (
              <div className="scroll-holder">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-holder">
                    <div className="form-sec-holder">
                      <h2>Profile</h2>
                      <p>
                        This information will be displayed publicly so be
                        careful what you share.
                      </p>

                      <div className="input-holder">
                        <div className="col-span-full">
                          <label htmlFor="photo" className="label-1">
                            Photo
                          </label>
                          <div className="mt-2 flex items-center gap-x-3">
                            {user && user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt="user-profile"
                                className="h-12 w-12 rounded-full p-1 bg-white shadow-sm"
                              />
                            ) : (
                              <p>Loading...</p>
                            )}
                            <p className="info">
                              Profile can't be changed. To update, change your
                              Google profile picture and log in again.
                            </p>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="first-name" className="label-1">
                            First name
                          </label>
                          <div className="mt-2">
                            <Controller
                              name="firstName"
                              control={control}
                              defaultValue={
                                user.displayName
                                  ? capitalizeFirstLetter(
                                      user.displayName.split(" ")[0]
                                    )
                                  : ""
                              }
                              render={({ field }) => (
                                <input
                                  type="text"
                                  id="first-name"
                                  autoComplete="given-name"
                                  className="inp-1"
                                  {...field}
                                />
                              )}
                            />
                            {errors.firstName && (
                              <p className="error-msg">
                                {errors.firstName.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="last-name" className="label-1">
                            Last name
                          </label>
                          <div className="mt-2">
                            <Controller
                              name="lastName"
                              control={control}
                              defaultValue={
                                user.displayName &&
                                user.displayName.split(" ")[1]
                                  ? capitalizeFirstLetter(
                                      user.displayName.split(" ")[1]
                                    )
                                  : ""
                              }
                              render={({ field }) => (
                                <input
                                  type="text"
                                  id="last-name"
                                  autoComplete="family-name"
                                  className="inp-1"
                                  {...field}
                                />
                              )}
                            />
                            {errors.lastName && (
                              <p className="error-msg">
                                {errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="pronoun" className="label-1">
                            Pronoun
                          </label>
                          <div className="mt-1">
                            <Controller
                              name="pronoun"
                              control={control}
                              render={({ field }) => (
                                <PronounSelector {...field} />
                              )}
                            />
                            {errors.pronoun && (
                              <p className="error-msg">
                                {errors.pronoun.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label htmlFor="email" className="label-1">
                            Email address
                          </label>
                          <div className="mt-2">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              value={user.email}
                              autoComplete="email"
                              disabled
                              className="inp-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-sec-holder">
                      <h2>Personal Information</h2>
                      <p>Use a permanent address where you can receive mail.</p>

                      <div className="input-holder">
                        <div className="col-span-full">
                          <label htmlFor="street-address" className="label-1">
                            Street address
                          </label>
                          <div className="mt-2">
                            <Controller
                              name="streetAddress"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="text"
                                  id="street-address"
                                  autoComplete="street-address"
                                  className="inp-1"
                                  {...field}
                                />
                              )}
                            />
                            {errors.streetAddress && (
                              <p className="error-msg">
                                {errors.streetAddress.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-2 sm:col-start-1">
                          <label htmlFor="city" className="label-1">
                            City
                          </label>
                          <div className="mt-2">
                            <Controller
                              name="city"
                              control={control}
                              render={({ field }) => (
                                <input
                                placeholder="Gampaha"
                                  type="text"
                                  id="city"
                                  autoComplete="address-level2"
                                  className="inp-1"
                                  {...field}
                                />
                              )}
                            />
                            {errors.city && (
                              <p className="error-msg">{errors.city.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="district" className="label-1">
                            district
                          </label>
                          <div className="mt-1">
                            <Controller
                              name="district"
                              control={control}
                              render={({ field }) => (
                                <Districtselect {...field} />
                              )}
                            />
                            {errors.district && (
                              <p className="error-msg">
                                {errors.district.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="postal-code" className="label-1">
                            ZIP / Postal code
                          </label>
                          <div className="mt-2">
                            <Controller
                              name="postalCode"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="text"
                                  id="postal-code"
                                  autoComplete="postal-code"
                                  className="inp-1"
                                  {...field}
                                />
                              )}
                            />
                            {errors.postalCode && (
                              <p className="error-msg">
                                {errors.postalCode.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-sec-holder">
                      <h2>NIC and More Personal Info</h2>
                      <p>
                        Provide accurate information to verify your NIC details.
                        Your birthday will be stored in the database, but your
                        gender will not. Your NIC information will only be
                        visible to you and the admin.
                      </p>
                      <div className="bg-blue-50 mt-5 shadow p-3 rounded-lg text-sm space-y-2">
                        <h1>
                          <SlInfo className="inline-block mr-[1px]" /> If you
                          are testing the prototype use following data to
                          continue
                        </h1>
                        <div className="flex gap-1 flex-grow flex-wrap *:border-l-2">
                          <div className="text-xs px-2 border-l-0">
                            NIC Number: 200600100014
                          </div>
                          <div className="text-xs px-2">Birth Year: 2006</div>
                          <div className="text-xs px-2">Birth Month: January (1)</div>
                          <div className="text-xs px-2">Birth Day: 1</div>
                          <div className="text-xs px-2">Gender: Male</div>
                        </div>
                      </div>
                      <div className="input-holder">
                        <div className="sm:col-span-2">
                          <label htmlFor="birth-year" className="label-1">
                            Birth Year
                          </label>
                          <div className="mt-1">
                            <Controller
                              name="birthYear"
                              control={control}
                              render={({ field }) => (
                                <BirthYearSelector {...field} />
                              )}
                            />
                            {errors.birthYear && (
                              <p className="error-msg">
                                {errors.birthYear.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="birth-month" className="label-1">
                            Birth Month
                          </label>
                          <div className="mt-1">
                            <Controller
                              name="birthMonth"
                              control={control}
                              render={({ field }) => (
                                <BirthMonthSelector {...field} />
                              )}
                            />
                            {errors.birthMonth && (
                              <p className="error-msg">
                                {errors.birthMonth.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="birth-day" className="label-1">
                            Birth Day
                          </label>
                          <div className="mt-2">
                            <Controller
                              name="birthDay"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="number"
                                  id="birth-day"
                                  autoComplete="off"
                                  className="inp-1"
                                  {...field}
                                />
                              )}
                            />
                            {errors.birthDay && (
                              <p className="error-msg">
                                {errors.birthDay.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="gender" className="label-1">
                            Gender
                          </label>
                          <div className="mt-1">
                            <Controller
                              name="gender"
                              control={control}
                              render={({ field }) => (
                                <NICGenderSelector {...field} />
                              )}
                            />
                            {errors.gender && (
                              <p className="error-msg">
                                {errors.gender.message}
                              </p>
                            )}
                          </div>
                          <p className="info">
                            This info won't be saved in the database and is only
                            used for verification.
                          </p>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="nic-number" className="label-1">
                            NIC Number
                          </label>
                          <div className="mt-2">
                            <Controller
                              name="nicNumber"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="text"
                                  id="nic-number"
                                  autoComplete="off"
                                  className="inp-1"
                                  {...field}
                                />
                              )}
                            />
                            {errors.nicNumber && (
                              <p className="error-msg">
                                {errors.nicNumber.message}
                              </p>
                            )}
                            <p className="info">
                              Your birthdate and gender will be used to verify
                              your NIC number. Please ensure that the
                              information you enter matches exactly what’s on
                              your NIC card.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white mt-5 shadow p-3 rounded-lg text-sm space-y-2">
                        <h1>
                          <SlInfo className="inline-block mr-[1px]" /> Why we
                          collect your NIC info?
                        </h1>
                        <div className="text-xs">
                          Your NIC is used to verify your official Advanced
                          Level (AL) examination results. This allows us to
                          directly fetch your grades from the official exam
                          database, eliminating the need for manual entry.
                        </div>
                        <div className="text-xs">
                          <b>Why This Data Matters: </b>We are developing an AI
                          model to help predict and improve your final AL grade.
                          By analyzing your interactions on the platform
                          alongside your actual grades, we aim to provide
                          personalized insights and better learning
                          recommendations.
                        </div>
                        <div className="text-xs bg-yellow-50 p-2 rounded-lg mt-1">
                          <div>
                            Your NIC, grades, and other personal information
                            will:
                          </div>
                          <ul>
                            <li>- Be visible only to you and the admin.</li>
                            <li>
                              - Never be shared, published, or disclosed to any
                              third party.
                            </li>
                            <li>
                              - Only be used to train and refine our AI models,
                              ensuring the data remains private and secure.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="form-sec-holder">
                      <h2>Academic Info</h2>
                      <p>It's all about what you do for A/Ls</p>

                      <div className="input-holder">
                        <div className="sm:col-span-2">
                          <label htmlFor="al-stream" className="label-1">
                            AL Stream
                          </label>
                          <div className="mt-1">
                            <Controller
                              name="alStream"
                              control={control}
                              render={({ field }) => (
                                <ALStreamSelector {...field} />
                              )}
                            />
                            {errors.alStream && (
                              <p className="error-msg">
                                {errors.alStream.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="academic-year" className="label-1">
                            Academic Year
                          </label>
                          <div className="mt-1">
                            <Controller
                              name="academicYear"
                              control={control}
                              render={({ field }) => (
                                <AcademicYearSelector {...field} />
                              )}
                            />
                            {errors.academicYear && (
                              <p className="error-msg">
                                {errors.academicYear.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="medium" className="label-1">
                            Medium
                          </label>
                          <div className="mt-1">
                            <Controller
                              name="medium"
                              control={control}
                              render={({ field }) => (
                                <MediumSelector {...field} />
                              )}
                            />
                            {errors.medium && (
                              <p className="error-msg">
                                {errors.medium.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <fieldset className="mt-5">
                        <legend className="text-sm font-semibold leading-6 text-gray-900">
                          Which of the following ICT units do you find most
                          challenging?
                        </legend>
                        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-8 sm:grid-cols-6 sm:col-span-4">
                          <div className="relative flex gap-x-2 sm:col-span-2">
                            <div className="flex h-6 items-center">
                              <Controller
                                name="challengingUnits.networking"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    id="networking"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
                                    {...field}
                                  />
                                )}
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="networking"
                                className="font-medium text-gray-900"
                              >
                                Networking and Data Communication
                              </label>
                            </div>
                          </div>
                          <div className="relative flex gap-x-2 sm:col-span-2">
                            <div className="flex h-6 items-center">
                              <Controller
                                name="challengingUnits.dbms"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    id="dbms"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
                                    {...field}
                                  />
                                )}
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="dbms"
                                className="font-medium text-gray-900"
                              >
                                Database Management Systems (DBMS)
                              </label>
                            </div>
                          </div>
                          <div className="relative flex gap-x-2 sm:col-span-2">
                            <div className="flex h-6 items-center">
                              <Controller
                                name="challengingUnits.systemAnalysis"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    id="system-analysis"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
                                    {...field}
                                  />
                                )}
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="system-analysis"
                                className="font-medium text-gray-900"
                              >
                                System Analysis and Design
                              </label>
                            </div>
                          </div>
                          <div className="relative flex gap-x-2 sm:col-span-2">
                            <div className="flex h-6 items-center">
                              <Controller
                                name="challengingUnits.programming"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    id="programming"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
                                    {...field}
                                  />
                                )}
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="programming"
                                className="font-medium text-gray-900"
                              >
                                Programming
                              </label>
                            </div>
                          </div>
                          <div className="relative flex gap-x-2 sm:col-span-2">
                            <div className="flex h-6 items-center">
                              <Controller
                                name="challengingUnits.numberSystems"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    id="number-systems"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
                                    {...field}
                                  />
                                )}
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="number-systems"
                                className="font-medium text-gray-900"
                              >
                                Number Systems
                              </label>
                            </div>
                          </div>
                          <div className="relative flex gap-x-2 sm:col-span-2">
                            <div className="flex h-6 items-center">
                              <Controller
                                name="challengingUnits.webDevelopment"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    id="web-development"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
                                    {...field}
                                  />
                                )}
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="web-development"
                                className="font-medium text-gray-900"
                              >
                                Web Development
                              </label>
                            </div>
                          </div>
                          <div className="relative flex gap-x-2 sm:col-span-2">
                            <div className="flex h-6 items-center">
                              <Controller
                                name="challengingUnits.other"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    id="other"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
                                    {...field}
                                  />
                                )}
                              />
                            </div>
                            <div className="text-sm leading-6">
                              <label
                                htmlFor="other"
                                className="font-medium text-gray-900"
                              >
                                Other
                              </label>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                  <p className="text-sm mt-10">
                    By clicking 'Save and Continue,' you acknowledge that you
                    have read and agree to our{" "}
                    <a className="underline" href="/legal/terms-and-conditions">
                      Terms and Conditions.
                    </a>
                  </p>

                  <div
                    className={`bg-yellow-100 shadow -m-1 ${
                      Object.keys(errors).length > 0 ? "p-2" : "p-0"
                    } rounded-lg mt-10 mb-2`}
                  >
                    {Object.keys(errors).length > 0 && (
                      <>
                        <p className="text-sm ">
                          Please address the following issues before proceeding.
                        </p>
                        <div className="error-list">
                          <ul>
                            {Object.values(errors).map((error, index) => (
                              <li key={index} className="error-msg">
                                {error.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                      type="button"
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                    >
                      Save and Continue
                    </button>
                  </div>
                </form>
              </div>
            )}
            {loading.submitting && (
              <div className="scroll-holder">
                <ErrorWithOllie
                  loading={true}
                  loadingTitle="Storing Info"
                  title={"Data in Motion!"}
                >
                  We’re just shaking things up a bit and securely storing your
                  user information. Your data is in good hands!{" "}
                </ErrorWithOllie>
              </div>
            )}
          </div>
        </div>
        <Toaster position="bottom-left" />
      </div>
    );
  }
}
