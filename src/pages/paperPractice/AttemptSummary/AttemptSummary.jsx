"use client";
import "./Analytics.css";
import "../paper-pra.css";
import parse from "html-react-parser";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QTitle from "./QTitle";
import Chart from "./Chart";
import { PieChartWeightUnit } from "./PieChart";
import SpiderChart from "./SpiderChart";
import { PopUpUnitSelect } from "./PopUpUnitSelect";
import PopUpOrderBySelect from "./PopUpOrderBySelect";

import { GoHash } from "react-icons/go";
import {
  RxCrossCircled,
  RxCheckCircled,
  RxMinusCircled,
  RxPerson,
  RxQuestionMarkCircled,
  RxCheck,
} from "react-icons/rx";
import { IoSearch, IoTimeOutline } from "react-icons/io5";
import { TbCirclePercentage } from "react-icons/tb";
import {
  BsArrowsAngleExpand,
  BsHexagon,
  BsJournalBookmark,
  BsSortDown,
  BsSortDownAlt,
} from "react-icons/bs";
import { PiLightbulbLight } from "react-icons/pi";
import {
  RiArtboardFill,
  RiBardFill,
  RiPieChart2Line,
  RiPieChartLine,
} from "react-icons/ri";

import ApexCharts from "apexcharts";

import {
  getAttemptData,
  getAttemptDataFromDB,
  getSortedKeys,
  getQuestionsData,
  getUnitData,
  setTimeSpentChartOptions,
  convertUnitsIntoPopUp,
  summarizeBySubUnitId,
  filterQuestionData,
  getSummarizedData,
  getSrotedData,
  formatTime,
  getQSortBy,
  convertQSortByIntoPopUp,
  getAttemptSummaryData,
  getPaperData,
  convertTimestampToDate,
  convertAttemptDataToChart,
  convertQuestionIntoPieChart,
  getSubUnitData,
  capitalizeFirstLetter,
} from "./AnalyticsFunctions";

import { parseHtml } from "../PastPaperFunc";
import { getAdditionalUserInfo } from "firebase/auth";
import { options } from "marked";
import { LuListFilter } from "react-icons/lu";
import { MdFilterListOff } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import ErrorWithOllie from "@/components/ErrorWithOllie/ErrorWithOllie";
import { CiBookmark, CiCalendar, CiCircleQuestion } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function AttemptSummaryPage() {

  const attemptId = useParams().att_id;

  const filterHolderRef = useRef(null);

  const [loading, setLoading] = useState({
    basicInfo: true,
    questionsData: true,
    questionDataPre: 0,
    questionsStartedLoading: false,
    subUnitData: true,
    subUnitDataLoaded: false,
  });
  const [errors, setErrors] = useState({
    basicInfo: 0,
    questionsData: null,
    unitData: null,
  });
  const [attemptData, setAttemptData] = useState(null);
  const [attemptSummaryData, setAttemptSummaryData] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [filteredQuestionsData, setFilteredQuestionsData] = useState(null);
  const [chartTimeSpentValues, setChartTimeSpentValues] = useState(null);
  const [questionFilter, setQuestionFilter] = useState({
    opened: false,
    keyword: "",
    answer: null,
    unit: null,
    qSortBy: 1,
    qSortByInfo: null,
    asd: true,
  });
  const [SummarizedNumbers, setSummaryNumbers] = useState({
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    totalTimeSpent: 0,
  });
  const [unitData, setUnitData] = useState(null);
  const [subUnitData, setSubUnitData] = useState(null);
  const [currentSubUnitData, setCurrentSubUnitData] = useState(null);
  const [currentSubUnitDataSummary, setCurrentSubUnitDataSummary] = useState(
    {}
  );

  useEffect(() => {
    if (questionsData) {
      convertQuestionIntoPieChart(questionsData, unitData);
      console.log("Unit data", unitData);
    }
  }, [questionsData]);

  //get the data from the database


  useEffect(() => {
    async function getData() {
      if (attemptId) {
        try {
          const data = await getAttemptData(attemptId);
          const summaryData = await getAttemptSummaryData(attemptId);
          setAttemptSummaryData(summaryData);
          const paperData = await getPaperData(summaryData.pp_id);
          console.log("PaperData", paperData);
          setAttemptSummaryData((prev) => ({
            ...prev,
            pp_sub_id: paperData.sub_id,
            pp_title: paperData.title,
            pp_v: paperData.version,
          }));

          // Sort attempt data and update state
          const sortedKeys = getSortedKeys(data);
          const sortedData = getSrotedData(sortedKeys, data);
          console.log("attsummarydata", attemptSummaryData);
          console.log("attempt_data", sortedData);
          setAttemptData(sortedData);
          setLoading((prev) => ({ ...prev, basicInfo: false }));
          setErrors((prev) => ({ ...prev, basicInfo: null }));

          // Prepare chart data
          const TimeSpentInEachQuestionTableOptions =
            setTimeSpentChartOptions(sortedData);
          setChartTimeSpentValues(TimeSpentInEachQuestionTableOptions);

          // Summarize data
          const summarizedData = getSummarizedData(sortedData);
          setSummaryNumbers(summarizedData);

          // Fetch and set unit data
          const unitData = getUnitData();
          setUnitData(unitData);

          // Get sorting information for questions
          const qSortByInfo = getQSortBy();
          setQuestionFilter((prev) => ({ ...prev, qSortByInfo: qSortByInfo }));
        } catch (error) {
          console.error("Error getting basic info or other data", error);

          // Check if the error has a 'status' property and use it, otherwise default to 500
          const errorCode = error.status || 403;

          setLoading((prev) => ({ ...prev, basicInfo: false }));
          setErrors((prev) => ({ ...prev, basicInfo: errorCode }));
        }
      }
    }

    getData();
  }, [attemptId]);

  useEffect(() => {
    const getPaperData = async (sortedKeys, sortedData, pp_v) => {
      console.log("paperdata version", pp_v);
      const questionsData = await getQuestionsData(
        sortedKeys,
        sortedData,
        pp_v,
        updateCurrentLoadingPointer
      );
      setQuestionsData(questionsData); // Fourth update here

      const filteredData = filterQuestionData(questionsData, questionFilter);
      setFilteredQuestionsData(filteredData);

      // Mark questions data loading as finished
      setLoading((prev) => ({ ...prev, questionsData: false }));
    };
    if (
      attemptData &&
      attemptSummaryData.pp_v &&
      !loading.questionsStartedLoading
    ) {
      setLoading((prev) => ({ ...prev, questionsStartedLoading: true }));
      getPaperData(
        Object.keys(attemptData),
        attemptData,
        attemptSummaryData.pp_v
      );
    }
  }, [attemptData, attemptSummaryData]);

  useEffect(() => {
    console.log("attemptSummaryData", attemptSummaryData);
  }, [attemptSummaryData]);

  //filter the questions when the filter is changed
  useEffect(() => {
    console.log("questionFilter", questionFilter);
    if (questionsData) {
      const filteredData = filterQuestionData(questionsData, questionFilter);
      setFilteredQuestionsData(filteredData);
      console.log("filteredData", filteredData);
      if (questionFilter.unit != null) {
        async function getSummarizedSubUnitData() {
          try {
            if (subUnitData == null) {
              const data = await getSubUnitData();
              setSubUnitData(data);
              setLoading((prev) => ({ ...prev, subUnitData: false }));
            }
            console.log("questionsData", questionsData);
            console.log(
              "summarized data",
              summarizeBySubUnitId(questionsData, questionFilter.unit)
            );
            setCurrentSubUnitData(
              summarizeBySubUnitId(questionsData, questionFilter.unit)
            );
          } catch (error) {
            console.log(error);
          }
        }
        getSummarizedSubUnitData();
      }
    }
  }, [questionFilter]);

  //everytime current subunit data is changes change the current subunit data summary
  useEffect(() => {
    if (currentSubUnitData) {
      const summary = {
        totalSum: 0,
        correctSum: 0,
        wrongSum: 0,
        skippedSum: 0,
        avgDuration: 0,
      };

      currentSubUnitData.forEach((item) => {
        summary.totalSum += item.total;
        summary.correctSum += item.correct;
        summary.wrongSum += item.wrong;
        summary.skippedSum += item.skipped;
        summary.avgDuration += item.avg_duration; // To compute the average later
      });

      // Calculate average of averages if there are any items
      const itemCount = currentSubUnitData.length;
      summary.avgDuration = itemCount > 0 ? summary.avgDuration / itemCount : 0;
      summary.totalPer = Math.round(
        (summary.totalSum / questionsData.length) * 100
      );
      summary.correctPer = Math.round(
        (summary.correctSum / summary.totalSum) * 100
      );

      setCurrentSubUnitDataSummary(summary);
    }
  }, [currentSubUnitData]);

  //toggle filter active
  useEffect(() => {
    const filterHolder = filterHolderRef.current;
    if (filterHolder) {
      if (questionFilter.opened) {
        filterHolder.classList.add("active");
        console.log("Filter is active");
      } else {
        filterHolder.classList.remove("active");
        console.log("Filter is not active");
      }
    }
  }, [questionFilter]);

  const onChangeKeyword = (e) => {
    setQuestionFilter((prev) => ({
      ...prev,
      keyword: e.target.value,
    }));
    ScrollTopOfQuestions();
  };

  const handleFilterByAns = (ansType) => {
    setQuestionFilter((prev) => ({
      ...prev,
      answer: ansType,
    }));
    ScrollTopOfQuestions();
    setQuestionFilter((prev) => ({
      ...prev,
      opened: false,
    }));
  };

  const handleFilterByUnit = (unit_id) => {
    console.log("unit_id", unit_id);
    setQuestionFilter((prev) => ({
      ...prev,
      unit: unit_id,
    }));
    console.log("questionFilter", questionFilter);
    ScrollTopOfQuestions();
  };

  const handleSortBy = (sortById) => {
    setQuestionFilter((prev) => ({
      ...prev,
      qSortBy: sortById,
    }));
    ScrollTopOfQuestions();
  };

  const ScrollTopOfQuestions = () => {
    setTimeout(() => {
      const questionsElement = document.getElementById("before-questions-div");
      if (questionsElement) {
        questionsElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        });
      }
    }, 100);
  };

  const handleClearFilter = () => {
    setQuestionFilter((prev) => ({
      ...prev,
      opened: false,
      keyword: "",
      answer: null,
      unit: null,
    }));
    ScrollTopOfQuestions();
  };

  const toggleSortByOrder = () => {
    setQuestionFilter((prev) => ({
      ...prev,
      asd: !prev.asd,
    }));
  };

  const updateCurrentLoadingPointer = (cuPointer) => {
    setLoading((prev) => ({ ...prev, questionDataPre: cuPointer }));
  };

  if (loading.basicInfo || errors.basicInfo == 0 || attemptId === null) {
    return (
      <div className="def-holder">
        <div className="def-child analytics-holder">
          <div className="main-info">
            <div className="title-info">
              <h1 className="def-loading-box bg-slate-200 w-48 h-7"></h1>
              <div className="other-info">
                <div className="def-loading-box h-5 w-24 pp-id"></div>
                <div className="def-loading-box h-5 w-10 yr"></div>
              </div>
            </div>
            <div className="select-attempt">
              <div className="selected-attempt">
                {attemptId ? (
                  <>
                    <GoHash /> {attemptId}
                  </>
                ) : (
                  "You'll be redirected"
                )}
              </div>
              <div className="def-loading-box bg-slate-100 date w-24 h-4">
                <CiCalendar className="z-20" />
              </div>
            </div>
          </div>
          <div className="overall-progress">
            <div className="flex gap-2">
              <div className="main-progress def-loading-box h-20 bg-slate-100"></div>
              <div className="main-progress def-loading-box w-32 bg-slate-100"></div>
            </div>
            <div>
              <div className="data-with-charts1">
                <div className="chart1">
                  <div className="chart-title">Summary</div>
                  <div className="chart-data-ver">
                    <div className="h-8 w-44 def-loading-box bg-slate-200"></div>
                    <div className="h-8 w-44 def-loading-box bg-slate-200"></div>
                    <div className="h-8 w-44 def-loading-box bg-slate-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="data-with-charts">
            <div className="w-full timespent def-loading-box bg-slate-100 h-64"></div>
          </div>
          <div className="data-with-charts">
            <div className="w-full timespent def-loading-box bg-slate-100 h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.basicInfo != null || errors.basicInfo != 0) {
    if (errors.basicInfo == 403) {
      return (
        <div className="def-holder">
          <ErrorWithOllie title="Access Denied" redirectToHome={true}>
            Hold up! You don't have access to this. Looks like you're trying to
            view someone else's data. If this feels off, hit up the admin!
          </ErrorWithOllie>
        </div>
      );
    }
    if (errors.basicInfo == 404) {
      return (
        <div className="def-holder">
          <ErrorWithOllie title="Not Found" redirectToHome={true}>
            Uh-oh, lost in space! We can't find what you're looking for. Check
            the URL or try again later!
          </ErrorWithOllie>
        </div>
      );
    }
  }

  return (
    <div className="def-holder">
      <div className="def-child analytics-holder">
        <div className="main-info">
          <div className="title-info">
            <h1>{attemptSummaryData.pp_title}</h1>
            <div className="other-info">
              <div className="pp-id">{attemptSummaryData.pp_sub_id}</div>
              <div className="yr">
                {attemptSummaryData.pp_id.match(/\d{4}/)[0]}
              </div>
            </div>
          </div>
          <div className="select-attempt">
            <div className="selected-attempt">
              <GoHash /> {attemptId}
            </div>
            <div className="date">
              <CiCalendar />
              {convertTimestampToDate(attemptSummaryData.timestamp.seconds)}
            </div>
          </div>
        </div>
        <div className="overall-progress">
          <div className="flex gap-2">
            <div className="main-progress">
              <div className="progress-title">
                <TbCirclePercentage /> Total Marks
              </div>
              <div className="data">{SummarizedNumbers.correct * 2}%</div>
            </div>
            <div className="progress">
              <div className="progress-title">
                <IoTimeOutline /> Time Spent
              </div>
              <div className="data">
                {formatTime(SummarizedNumbers.totalTimeSpent)}
              </div>
            </div>
          </div>
          <div>
            <div className="data-with-charts1">
              <div className="chart1">
                <div className="chart-title">Summary</div>
                <div className="chart-data-ver">
                  <div className="ver-bar">
                    <div className="title">
                      <RxCheckCircled /> Correct
                    </div>
                    <div className="data">{SummarizedNumbers.correct * 2}%</div>
                    <div
                      className="bar correct"
                      style={{ width: `${SummarizedNumbers.correct * 2}%` }}
                    ></div>
                  </div>
                  <div className="ver-bar">
                    <div className="title">
                      <RxCrossCircled /> Wrong
                    </div>
                    <div className="data">
                      {SummarizedNumbers.incorrect * 2}%
                    </div>
                    <div
                      className="bar wrong"
                      style={{ width: `${SummarizedNumbers.incorrect * 2}%` }}
                    ></div>
                  </div>
                  <div className="ver-bar">
                    <div className="title">
                      <RxMinusCircled /> Skipped
                    </div>
                    <div className="data">
                      {SummarizedNumbers.unanswered * 2}%
                    </div>
                    <div
                      className="bar skipped"
                      style={{
                        width: `${SummarizedNumbers.unanswered * 2}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="data-with-charts">
          <div className="chart-holder timespent">
            <div className="chart-title">
              <IoTimeOutline /> Time Spent in each question
            </div>
            <div className="scroll-chart-holder timespent">
              <div className="scroll-chart">
                <Chart
                  className="chart timespent"
                  data={convertAttemptDataToChart(attemptData)}
                ></Chart>
              </div>
            </div>
          </div>
          <div className="chart-holder chart2">
            <div className="chart-title">
              <RiPieChartLine className="mr-1" />
              Unit Weightage
            </div>
            {questionsData && unitData ? (
              <PieChartWeightUnit
                chartData={convertQuestionIntoPieChart(questionsData, unitData)}
              />
            ) : (
              <div className="def-loading-box bg-white h-80 max-w-full w-96 mt-0"></div>
            )}
          </div>
          <div className="chart-holder chart2">
            <div className="chart-title">
              <BsHexagon className="mr-1" />
              Performance in each unit
            </div>
            {questionsData && unitData ? (
              <SpiderChart
                chartData={convertQuestionIntoPieChart(questionsData, unitData)}
                attemptId={attemptId}
              />
            ) : (
              <div className="def-loading-box bg-white h-80 max-w-full w-96 mt-0"></div>
            )}
            <div id="before-questions-div"></div>
          </div>
        </div>
        <div className="questions-holder" id="questions">
          <div
            className={"questions-filter-holder"}
            id="questions-filter-holder"
            ref={filterHolderRef}
          >
            <div className="top-title">
              <div className="title">Questions</div>
              <div className="other-opt">
                {loading.questionsData ? (
                  <div className="flex items-center gap-1 bg-blue-50 p-1 px-2 rounded-full">
                    <AiOutlineLoading3Quarters className="def-loading-svg" />{" "}
                    Loading
                  </div>
                ) : (
                  <>
                    <div className="order-by">
                      <button
                        className="sort-by-btn"
                        onClick={toggleSortByOrder}
                      >
                        {questionFilter.asd ? (
                          <BsSortDown />
                        ) : (
                          <BsSortDownAlt />
                        )}
                      </button>
                      {/* <button
                        className="order-by-btn"
                        onClick={openSortByPopUp}
                      >
                        {parse(
                          questionFilter?.qSortByInfo?.[questionFilter?.qSortBy]
                            ?.svg || ""
                        )}
                        {questionFilter?.qSortByInfo?.[questionFilter?.qSortBy]
                          ?.title || "Question No"}
                      </button> */}
                      <PopUpOrderBySelect
                        options={convertQSortByIntoPopUp(
                          questionFilter.qSortByInfo
                        )}
                        onPositionChange={handleSortBy}
                      />
                    </div>
                    <button
                      className="filter-toggle-btn"
                      onClick={() => {
                        setQuestionFilter((prev) => ({
                          ...prev,
                          opened: !prev.opened,
                        }));
                      }}
                    >
                      <LuListFilter />
                    </button>
                  </>
                )}
              </div>
            </div>
            {!loading.questionsData && (
              <div className="more-opt">
                <div className="filter-opts">
                  <div className="search-bar">
                    <IoSearch />
                    <input
                      type="text"
                      value={questionFilter.keyword}
                      placeholder="search question by title"
                      onChange={onChangeKeyword}
                    />
                  </div>
                  <div className="filter-btns">
                    <div className="filter-by-ans">
                      <p>Ans:</p>
                      <button
                        className={`${
                          questionFilter.answer && questionFilter.answer
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleFilterByAns(true)}
                      >
                        <RxCheckCircled /> Correct ({SummarizedNumbers.correct})
                      </button>
                      <button
                        className={`${
                          questionFilter.answer != null &&
                          !questionFilter.answer
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleFilterByAns(false)}
                      >
                        <RxCrossCircled /> Wrong ({SummarizedNumbers.incorrect})
                      </button>
                      <button
                        className={`no-banner ${
                          /*questionFilter.answer === null ? "active" : ""*/ ""
                        }`}
                        onClick={() => handleFilterByAns(null)}
                      >
                        <RxMinusCircled />
                      </button>
                    </div>
                    <div className="select-unit">
                      <p>Unit:</p>
                      <PopUpUnitSelect
                        frameworks={convertUnitsIntoPopUp(unitData)}
                        onUnitSelect={handleFilterByUnit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="questions" id="questions">
            {questionFilter.unit && (
              <div className="summary">
                <div className="title">
                  <RiBardFill /> Summary of Unit{" "}
                  <span className="unit">
                    <span className="unit-id">{questionFilter.unit}</span>{" "}
                    {unitData[questionFilter.unit]?.shrt}
                  </span>
                </div>
                {loading.subUnitData ? (
                  <div className="sub-units">
                    <div className="line"></div>
                    <div className="sub-unit">
                      <div className="sub-unit-id def-loading-box ">0_0</div>
                      <div className="more-info">
                        <div className="sub-unit-name def-loading-box bg-white h-5 w-36"></div>
                        <div className="info">
                          <div className="card def-loading-box h-5 w-10"></div>
                          <div className="card def-loading-box h-5 w-10"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="sub-units">
                      <div className="line"></div>
                      {currentSubUnitData &&
                        currentSubUnitData.map((sub_unit) => (
                          <div className="sub-unit" key={sub_unit.sub_id}>
                            <div className="sub-unit-id">{sub_unit.sub_id}</div>
                            <div className="more-info">
                              <div className="sub-unit-name">
                                {capitalizeFirstLetter(
                                  subUnitData[sub_unit.sub_id]?.sub_unit_title
                                ) || "Unknown"}
                              </div>
                              <div className="info">
                                <div className="card">
                                  <RxQuestionMarkCircled /> {sub_unit.total}/
                                  {currentSubUnitDataSummary &&
                                    currentSubUnitDataSummary.totalSum}
                                </div>
                                <div className="card">
                                  <FiClock />
                                  {formatTime(sub_unit.avg_duration)}
                                </div>
                                {sub_unit.correct > 0 && (
                                  <div className="card correct">
                                    <RxCheckCircled />
                                    {sub_unit.correct}
                                  </div>
                                )}
                                {sub_unit.wrong > 0 && (
                                  <div className="card wrong">
                                    <RxCrossCircled />
                                    {sub_unit.wrong}
                                  </div>
                                )}
                                {sub_unit.skipped > 0 && (
                                  <div className="card skip">
                                    <RxMinusCircled />
                                    {sub_unit.skipped}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    {currentSubUnitDataSummary && (
                      <div className="more-summary">
                        <div className="chart2">
                          <div className="bar">
                            <div className="top">
                              <div className="unit-data">
                                <div className="unit-no">
                                  {questionFilter.unit}
                                </div>
                                <div className="unit-title">
                                  {unitData[questionFilter.unit]?.shrt}
                                </div>
                              </div>
                              <div className="achievement">
                                {currentSubUnitDataSummary.correctPer}%
                              </div>
                            </div>
                            <div className="bottom">
                              <div className="q-asked-bar">
                                <div
                                  className="q-asked-fill"
                                  style={{
                                    width: `${currentSubUnitDataSummary.totalPer}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="q-asked">
                                {currentSubUnitDataSummary.totalSum}/50
                              </div>
                            </div>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${currentSubUnitDataSummary.correctPer}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-more-summary">
                          <div className="card">
                            <RxQuestionMarkCircled />{" "}
                            {currentSubUnitDataSummary.totalSum}
                            <span className="out-of">
                              /{questionsData.length} (
                              {currentSubUnitDataSummary.totalPer}%)
                            </span>
                          </div>
                          <div className="card">
                            <FiClock />{" "}
                            {formatTime(currentSubUnitDataSummary.avgDuration)}
                          </div>
                          <div className="card correct">
                            <RxCheckCircled />{" "}
                            {currentSubUnitDataSummary.correctSum}{" "}
                            <span className="out-of">
                              /{currentSubUnitDataSummary.totalSum} (
                              {currentSubUnitDataSummary.correctPer})
                            </span>
                          </div>
                          <div className="card wrong">
                            <RxCrossCircled />{" "}
                            {currentSubUnitDataSummary.wrongSum}
                            <span className="out-of">
                              /{currentSubUnitDataSummary.totalSum} (
                              {Math.round(
                                (currentSubUnitDataSummary.wrongSum /
                                  currentSubUnitDataSummary.totalSum) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                          <div className="card">
                            <RxMinusCircled />{" "}
                            {currentSubUnitDataSummary.skippedSum}/
                            {currentSubUnitDataSummary.totalSum} (
                            {Math.round(
                              (currentSubUnitDataSummary.skippedSum /
                                currentSubUnitDataSummary.totalSum) *
                                100
                            )}
                            %)
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {!loading.questionsData ? (
              filteredQuestionsData?.length > 0 ? (
                filteredQuestionsData.map((question, index) => (
                  <div className="question" key={question.q_id}>
                    {/* Question number */}
                    <div className="q-no">{question.q_id.slice(-2)}</div>

                    {/* Question text */}
                    <div className="q-more-info">
                      <QTitle question={question} />

                      {/* Answers */}
                      {/*<ol>
                        <li>{parseHtml(String(question.ans1))}</li>
                        <li>{parseHtml(String(question.ans2))}</li>
                        <li>{parseHtml(String(question.ans3))}</li>
                        <li>{parseHtml(String(question.ans4))}</li>
                        <li>{parseHtml(String(question.ans5))}</li>
                      </ol>*/}

                      {/* Correct Answer */}
                      {Array.isArray(question.ans_no) ? (
                        question.ans_no.map((ansIndex) => (
                          <div className="ans correct">
                            <div className="left">
                              <div className="mark">
                                <RxCheckCircled />
                              </div>
                              <div className="ans-lab">
                                {parseHtml(String(question[`ans${ansIndex}`]))}
                              </div>
                            </div>
                            <div className="right">
                              <div className="number">80%</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="ans correct">
                          <div className="left">
                            <div className="mark">
                              <RxCheckCircled />
                            </div>
                            <div className="ans-lab">
                              {parseHtml(
                                String(question[`ans${question.ans_no}`])
                              )}
                            </div>
                          </div>
                          <div className="right">
                            <div className="number">80%</div>
                          </div>
                        </div>
                      )}

                      {/* Wrong Answer (example) */}
                      {attemptData[question.q_id].ans != null &&
                        !attemptData[question.q_id].correct && (
                          <div className="ans wrong">
                            <div className="left">
                              <div className="mark">
                                <RxCrossCircled />
                              </div>
                              <div className="ans-lab">
                                {parseHtml(
                                  String(
                                    question[
                                      `ans${attemptData[question.q_id].ans}`
                                    ]
                                  )
                                )}
                              </div>
                            </div>
                            <div className="right">
                              <div className="number">10%</div>
                            </div>
                          </div>
                        )}
                      <div className="more-info">
                        <div
                          className={`info-svg ${
                            attemptData[question.q_id].ans != null
                              ? attemptData[question.q_id].correct
                                ? "correct"
                                : "wrong"
                              : "skipped"
                          }`}
                        >
                          {attemptData[question.q_id].ans != null ? (
                            attemptData[question.q_id].correct ? (
                              <RxCheckCircled />
                            ) : (
                              <RxCrossCircled />
                            )
                          ) : (
                            <RxMinusCircled />
                          )}
                        </div>
                        <div className="info">
                          <RxPerson /> 20
                        </div>
                        <div className="info">
                          <FiClock />
                          {formatTime(attemptData[question.q_id].duration)}
                        </div>
                        <div className="info">
                          <BsJournalBookmark />
                          {unitData[question.unit_id] &&
                            unitData[question.unit_id].shrt}
                        </div>
                        <div className="info">
                          <CiBookmark />
                          <div>
                            {" "}
                            <span className="font-bold">
                              {question.tag_id.split(".")[0]}.
                              {question.tag_id.split(".")[1]}
                            </span>
                            .{question.tag_id.split(".")[2]}{" "}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <ErrorWithOllie
                  title="No Matches Found :("
                  clearFilter={true}
                  action={handleClearFilter}
                >
                  Ollie couldn’t find the match you’re looking for. Try
                  adjusting your filters or searching again.
                </ErrorWithOllie>
              )
            ) : (
              <ErrorWithOllie
                title="Hold tight!"
                loading={true}
                loadingTitle={`Downloading ${Math.round(
                  Math.abs(
                    (loading.questionDataPre /
                      Object.keys(attemptData).length) *
                      100
                  )
                )}%`}
              >
                Ollie's downloading quections...
              </ErrorWithOllie>
            )}
          </div>
          <div className="bottom-filters">
            <div className="applied-filter">
              {filteredQuestionsData?.length > 0 &&
                (questionFilter.keyword ||
                  questionFilter.answer != null ||
                  questionFilter.unit) && (
                  <>
                    Filter Applied ({filteredQuestionsData?.length})
                    <button onClick={handleClearFilter}>
                      <MdFilterListOff /> Clear Filter
                    </button>
                  </>
                )}
            </div>
            <div className="filter-by-ans">
              <p>Ans:</p>
              <button
                className={`${
                  questionFilter.answer && questionFilter.answer ? "active" : ""
                }`}
                onClick={() => handleFilterByAns(true)}
              >
                <RxCheckCircled /> Correct ({SummarizedNumbers.correct})
              </button>
              <button
                className={`${
                  questionFilter.answer != null && !questionFilter.answer
                    ? "active"
                    : ""
                }`}
                onClick={() => handleFilterByAns(false)}
              >
                <RxCrossCircled /> Wrong ({SummarizedNumbers.incorrect})
              </button>
              <button
                className={`no-banner ${
                  /*questionFilter.answer === null ? "active" : ""*/ ""
                }`}
                onClick={() => handleFilterByAns(null)}
              >
                <RxMinusCircled />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
