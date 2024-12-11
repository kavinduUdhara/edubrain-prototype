import { db } from "@/firebase";
import { getDoc, doc } from "firebase/firestore";
async function getAttemptDataFromDB() {
  const docRef = doc(db, "paper_attempts", "RUIqZqZEAEcS0hZGSF9V");
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return data.answers;
}
const getAttemptData = async (docID) => {
  console.log("getting data");
  const docRef = doc(db, "paper_attempts", docID);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    const error = new Error("Document not found");
    error.status = 404;
    throw error;
  }
  const data = docSnap.data();
  return data.answers;
};

const getAttemptSummaryData = async (docID) => {
  const docRef = doc(db, "paper_attempts_summary", docID);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return data;
};
const getPaperData = async (docID) => {
  const docRef = doc(db, "papers", docID);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return data;
};

const getSubUnitData = async () => {
  const docRef = doc(db, "brief_det", "sub_units");
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return data.data;
};

const setTimeSpentChartOptions = (data) => {
  const questionIds = Array.from({ length: 50 }, (_, i) => i + 1);
  const durations = Object.values(data).map((item) => item.duration);

  var options = {
    series: [
      {
        name: "Data",
        data: durations,
      },
    ],
    chart: {
      height: 200,
      type: "bar",
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        dataLabels: {
          position: "top", // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: false,
      offsetY: -30,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },

    xaxis: {
      categories: questionIds,
      position: "bottom",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        fill: {
          type: "gradient",
          gradient: {
            colorFrom: "#D8E3F0",
            colorTo: "#BED1E6",
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: true,
        formatter: function (val) {
          return formatTime(val);
        },
      },
    },
  };

  return options;
};
function formatTime(val) {
  // Calculate hours, minutes, and seconds
  const hours = Math.floor(val / 3600);
  val %= 3600;
  const minutes = Math.floor(val / 60);
  const seconds = val % 60;

  // Create the formatted time string
  let result = "";

  if (hours > 0) {
    result += `${Math.round(hours)}h `;
  }
  if (minutes > 0 || hours > 0) {
    result += `${Math.round(minutes)}m `;
  }
  result += `${Math.round(seconds)}s`;

  return result.trim(); // Remove any trailing space
}


import { getQuestion, isSameVersion, questionExists, storeQuestion } from "@/utils/ques_db";
import { processQuestionToHtml } from "../PastPaperFunc";
const processAndPushData = (tempData, q_id, attemptData, data) => {
  data.push({
    q_id: tempData.q_id,
    q_title: processQuestionToHtml(tempData.q_title),
    ans1: processQuestionToHtml(tempData.ans1),
    ans2: processQuestionToHtml(tempData.ans2),
    ans3: processQuestionToHtml(tempData.ans3),
    ans4: processQuestionToHtml(tempData.ans4),
    ans5: processQuestionToHtml(tempData.ans5),
    ans_no: tempData.ans_no,
    correct:
      attemptData[q_id] && attemptData[q_id].ans === null
        ? null
        : attemptData[q_id]
        ? attemptData[q_id].correct
        : null,
    unit_id: tempData.unit_id,
    sub_id: tempData.sub_unit_id,
    tag_id: tempData.tag_id,
    duration: attemptData[q_id] && attemptData[q_id].duration,
  });
};

const getQuestionsData = async (
  q_ids,
  attemptData,
  pp_v,
  CurrentPointerUpdateFunc
) => {
  let data = [];

  // Use for-loop to track the index
  for (let i = 0; i < q_ids.length; i++) {
    const q_id = q_ids[i];
    console.log(q_id);
    let tempData;

    // Update the current pointer by passing the index (i + 1) to reflect the current iteration (1-based index)
    CurrentPointerUpdateFunc(i + 1); // Calling the function to update the pointer

    if ((await questionExists(q_id)) || (await isSameVersion(pp_v, q_id))) {
      tempData = await getQuestion(q_id);
    } else {
      const questionDocRef = doc(db, "questions", q_id);
      const questionDocSnap = await getDoc(questionDocRef);
      if (questionDocSnap.exists()) {
        tempData = questionDocSnap.data();
        tempData["v"] = questionDocSnap.data().version; // Update with correct version
        await storeQuestion(tempData);
      }
    }

    if (tempData) {
      processAndPushData(tempData, q_id, attemptData, data);
    }
  }

  return data;
};

const filterQuestionData = (data, filter) => {
  // Filtering logic
  const filteredData = data.filter((question) => {
    // Check if the keyword is present in the question title (q_title)
    const keywordMatch = filter.keyword
      ? question.q_title.toLowerCase().includes(filter.keyword.toLowerCase())
      : true; // Ignore filter if keyword is not set (null or empty string)

    // Check if the correct field matches the filter's correct value
    const correctMatch =
      filter.answer !== null ? question.correct === filter.answer : true; // Ignore filter if correct is not set

    // Check if the unit_id matches the filter's unit
    const unitMatch = filter.unit
      ? parseInt(question.unit_id) === filter.unit
      : true; // Convert unit_id to int and ignore filter if unit is not set

    // Return true if all active filter conditions match
    return keywordMatch && correctMatch && unitMatch;
  });

  // Sorting logic with ascending/descending based on filter.asd
  const sortedData = filteredData.sort((a, b) => {
    let comparison = 0;

    switch (filter.qSortBy) {
      case 1: // Sort by Question No (assuming `q_id` determines question order)
        comparison = a.q_id.localeCompare(b.q_id);
        break;
      case 2: // Sort by Time Spent (assuming there's a time field in data)
        comparison = b.duration - a.duration; // Example: replace with actual field if needed
        break;
      case 3: // Sort by Unit ID
        comparison = parseInt(a.unit_id) - parseInt(b.unit_id);
        break;
      default:
        comparison = 0; // No sorting if no valid qSortBy is provided
        break;
    }

    // Apply ascending or descending based on filter.asd (true = ascending, false = descending)
    return filter.asd ? comparison : -comparison;
  });

  return sortedData;
};

const getSortedKeys = (data) => {
  return Object.keys(data).sort((a, b) => a.localeCompare(b));
};

const getSrotedData = (keys, data) => {
  const sortedData = {};
  keys.forEach((key) => {
    sortedData[key] = data[key];
  });
  return sortedData;
};

const getSummarizedData = (data) => {
  const correct = Object.values(data).filter(
    (item) => item.correct === true && item.ans != null
  ).length;
  const incorrect = Object.values(data).filter(
    (item) => item.correct === false && item.ans != null
  ).length;
  const unanswered = Object.values(data).filter(
    (item) => item.ans === null
  ).length;
  const totalTimeSpent = Object.values(data).reduce(
    (total, item) => total + item.duration,
    0
  );
  return {
    correct,
    incorrect,
    unanswered,
    totalTimeSpent,
  };
};

const getUnitData = () => {
  return {
    1: {
      shrt: "ICT Basic",
      sin_title: "ICT පිළිබද සංකල්ප",
      periods: 28,
      unit_title: "Basic Concepts of ICT",
      unit_id: 1,
    },
    2: {
      shrt: "Comp Intr",
      sin_title: "පරිගණකය හැදින්වීම",
      periods: 22,
      unit_title: "Introduction to Computer",
      unit_id: 2,
    },
    3: {
      shrt: "Num Sys",
      sin_title: "දත්ත නිරුපණය",
      periods: 18,
      unit_title: "Number Systems",
      unit_id: 3,
    },
    4: {
      shrt: "Logic Gts",
      sin_title: "තාර්කික ද්වාර",
      periods: 26,
      unit_title: "Logic Gates",
      unit_id: 4,
    },
    5: {
      shrt: "OS",
      sin_title: "පරිගණක මෙහෙයුම් පද්ධති",
      periods: 22,
      unit_title: "Computer Operating System",
      unit_id: 5,
    },
    6: {
      shrt: "Net & Com",
      sin_title: "දත්ත සන්නිවේදනය හා ජාලකරණය",
      periods: 50,
      unit_title: "Networking and Data Communication",
      unit_id: 6,
    },
    7: {
      shrt: "Sys Des",
      sin_title: "පද්ධති විශ්ලේෂණය හා පිරිසැලසුම",
      periods: 68,
      unit_title: "System Analysis and Design",
      unit_id: 7,
    },
    8: {
      shrt: "DBMS",
      sin_title: "දත්ත සමුදාය කළමනාකරණය",
      periods: 50,
      unit_title: "Database Management (DBMS)",
      unit_id: 8,
    },
    9: {
      shrt: "Coding",
      sin_title: "ක්‍රමලේඛකරණය",
      periods: 74,
      unit_title: "Programming",
      unit_id: 9,
    },
    10: {
      shrt: "Web Dev",
      sin_title: "වෙබ් අඩවි සංවර්ධනය",
      periods: 60,
      unit_title: "Web Development",
      unit_id: 10,
    },
    11: {
      shrt: "IoT",
      sin_title: "අන්තර්ජාල සබැදි ද්‍රව්‍ය",
      periods: 15,
      unit_title: "Internet of Things",
      unit_id: 11,
    },
    12: {
      shrt: "ICT Biz",
      sin_title: "ව්‍යාපාර තුල ICT",
      periods: 12,
      unit_title: "ICT in Business",
      unit_id: 12,
    },
    13: {
      shrt: "New Tech",
      sin_title: "ICT හි නව නැඹුරු සහ අනාගත දිශානති",
      periods: 12,
      unit_title: "New Trends and Future Directions",
      unit_id: 13,
    },
  };
};

const getQSortBy = () => {
  return {
    1: {
      q_sort_by_id: 1,
      svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9.618 1.76a.75.75 0 0 1 .623.859L9.46 7.5h6.48l.82-5.118a.75.75 0 0 1 1.48.237L17.46 7.5h3.79a.75.75 0 0 1 0 1.5h-4.03l-.96 6h3.99a.75.75 0 0 1 0 1.5h-4.23l-.78 4.869a.75.75 0 0 1-1.48-.237l.74-4.632H8.02l-.78 4.869a.75.75 0 0 1-1.48-.237L6.5 16.5H2.745a.75.75 0 0 1 0-1.5H6.74l.96-6H3.75a.75.75 0 0 1 0-1.5h4.19l.82-5.118a.75.75 0 0 1 .858-.622ZM14.741 15l.96-6H9.22l-.96 6Z"></path></svg>',
      title: "Question No",
    },
    2: {
      q_sort_by_id: 2,
      svg: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
      title: "Time Spent",
    },
    3: {
      q_sort_by_id: 3,
      svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 8V1h1v6.117L8.743 6.07a.5.5 0 0 1 .514 0L11 7.117V1h1v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8"></path><path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"></path><path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"></path></svg>',
      title: "Unit ID",
    },
  };
};

const convertAttemptDataToChart = (data) => {
  let temp = [];

  Object.keys(data).forEach((key) => {
    temp.push({
      id: key,
      duration: data[key].duration,
    });
  });

  return temp;
}

const convertQuestionIntoPieChart = (Qdata, unitData) => {
  // Calculate unit count and correct answers
  const unitCount = Qdata.reduce((acc, item) => {
    acc[item.unit_id] = (acc[item.unit_id] || 0) + 1;
    return acc;
  }, {});

  const correctAnswers = Qdata.reduce((acc, item) => {
    if (item.correct) {
      acc[item.unit_id] = (acc[item.unit_id] || 0) + 1;
    }
    return acc;
  }, {});

  // Prepare unitCount with additional properties
  Object.keys(unitCount).forEach((key) => {
    unitCount[key] = {
      unit_id: key,
      unit_title: unitData[key].shrt,
      count: unitCount[key],
      correct: correctAnswers[key] || 0,
      performance: correctAnswers[key]
        ? Math.round((correctAnswers[key] / unitCount[key]) * 100)
        : 0,
    };
  });

  const data = Object.values(unitCount);
  const sortedData = data.sort((a, b) => b.count - a.count);
  const top5Units = sortedData.slice(0, 5);

  // Calculate "other" category for remaining units
  const otherUnits = sortedData.slice(5);
  const otherCount = otherUnits.reduce((acc, unit) => acc + unit.count, 0);
  const otherCorrect = otherUnits.reduce((acc, unit) => acc + unit.correct, 0);
  const otherPerformance = otherCorrect
    ? Math.round((otherCorrect / otherCount) * 100)
    : 0;

  // Add "other" to the top 5
  if (otherCount > 0) {
    top5Units.push({
      unit_id: "other",
      unit_title: "Other",
      count: otherCount,
      correct: otherCorrect,
      performance: otherPerformance,
    });
  }

  console.log(top5Units);
  return top5Units;
};


const convertUnitsIntoPopUp = (units) => {
  if (units) {
    let returnData = [];
    Object.keys(units).map((key) => {
      const unit = units[key];
      let temp = {
        value: unit.unit_id,
        //num: unit.unit_id,
        //title: unit.unit_title,
        label: unit.unit_title,
        shrt: unit.shrt
      };
      returnData.push(temp);
    });
    console.log("returnData", returnData);
    return returnData;
  }
};
const convertQSortByIntoPopUp = (qSortBy) => {
  if (qSortBy) {
    let returnData = [];
    Object.keys(qSortBy).map((key) => {
      const qSort = qSortBy[key];
      let temp = {
        value: qSort.q_sort_by_id,
        id: qSort.q_sort_by_id,
        title: qSort.title,
        svg: qSort.svg,
        label: qSort.title,
      };
      returnData.push(temp);
    });
    console.log("returnData", returnData);
    return returnData;
  }
};

const convertTimestampToDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const summarizeBySubUnitId = (questions, unitID) => {
  const summary = {};

  // Filter questions by unitID
  const filteredQuestions = questions.filter(q => parseInt(q.unit_id) === unitID);

  // Summarize the filtered questions by sub_id
  filteredQuestions.forEach((q) => {
    if (!summary[q.sub_id]) {
      summary[q.sub_id] = {
        sub_id: q.sub_id,
        total: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        total_duration: 0,
        avg_duration: 0,
      };
    }

    const currentSummary = summary[q.sub_id];

    currentSummary.total++;
    currentSummary.total_duration += q.duration;

    if (q.correct === true) {
      currentSummary.correct++;
    } else if (q.correct === false) {
      currentSummary.wrong++;
    } else if (q.correct === null) {
      currentSummary.skipped++;
    }
  });

  // Convert total_duration to avg_duration
  Object.values(summary).forEach((s) => {
    s.avg_duration = s.total > 0 ? s.total_duration / s.total : 0;
    delete s.total_duration; // Remove the total_duration field if not needed
  });

  // Convert the object to an array and sort it by sub_id
  const sortedSummary = Object.values(summary).sort((a, b) => {
    const [aMajor, aMinor] = a.sub_id.split(".").map(Number);
    const [bMajor, bMinor] = b.sub_id.split(".").map(Number);

    // Compare first by major unit, then by minor unit
    if (aMajor === bMajor) {
      return aMinor - bMinor;
    } else {
      return aMajor - bMajor;
    }
  });

  return sortedSummary;
};


function capitalizeFirstLetter(string) {
  if (typeof string !== 'string' || string.length === 0) {
    return "";
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export {
  getAttemptData,
  getAttemptDataFromDB,
  getAttemptSummaryData,
  getPaperData,
  setTimeSpentChartOptions,
  getQuestionsData,
  filterQuestionData,
  getSortedKeys,
  getSrotedData,
  getSummarizedData,
  convertUnitsIntoPopUp,
  convertQSortByIntoPopUp,
  getUnitData,
  getQSortBy,
  formatTime,
  convertTimestampToDate,
  convertAttemptDataToChart,
  convertQuestionIntoPieChart,
  summarizeBySubUnitId,
  getSubUnitData,
  capitalizeFirstLetter,
};
