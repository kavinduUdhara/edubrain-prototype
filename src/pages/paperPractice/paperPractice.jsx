"use client";
import "./paper-pra.css";

import ImageWithLoading from "@/components/ImageWithLoading";

import React, { useState, useEffect, useMemo } from "react";

import toast, { Toaster } from "react-hot-toast";

import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "@/firebase";
import {
  storeQuestion,
  storeAnswer,
  storePaper,
  updateTimeLeftInPaper,
  getQuestion,
  getAnswer,
  getPaper,
  questionExists,
  answerExists,
  paperExists,
  updateAnswerField,
  deleteNonMatchingQuesRecords,
  deleteNonMatchingAnsRecords,
  deleteAnswersByPPId,
  isSameVersion,
} from "@/utils/ques_db";

import { marked } from "marked";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

import { HiOutlineHome } from "react-icons/hi2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoClock } from "react-icons/go";
import { RiSendPlaneLine } from "react-icons/ri";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import { LuInfo } from "react-icons/lu";
import { IoCloudOutline } from "react-icons/io5";
import { MdOutlineCloudSync } from "react-icons/md";
import { MdComputer } from "react-icons/md";
import ErrorWithOllie from "@/components/ErrorWithOllie/ErrorWithOllie";

import { useParams, useNavigate } from "react-router-dom";

import floatingObjsImg from "@/assets/img/objects/floating-objects.png";

import { processQuestionToHtml, parseHtml } from "./PastPaperFunc";

export default function PaperPractice() {
  const navigate = useNavigate();

  const paperId = useParams().pp_id;

  const [paper, setPaper] = useState({});
  const [loadingPaper, setLoadingPaper] = useState(true);
  const [paperNotFound, setPaperNotFound] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState({
    bool: true,
    started: false,
    syncDraftData: false,
    submit: false,
    syncedAt: null,
    current_no: 0,
    total_no: 0,
  });
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [currentQuestionContent, setCurrentQuestionContent] = useState({
    title: null,
    ans1: null,
    ans2: null,
    ans3: null,
    ans4: null,
    ans5: null,
  });
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [userAns, setUserAns] = useState(null);
  const [progress, setProgress] = useState({ done: 0, touched: 0 });
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 hours in seconds
  const [ExtraTimeSpentMessageShown, setExtraTimeSpentMessageShown] =
    useState(false);
  const [currentQuestionDuration, setCurrentQuestionDuration] = useState({
    startTime: null,
    endTime: null,
    relatedQuestionId: null,
  });
  const [syncedMuntesAgo, setMinutesAgo] = useState(0);
  const [syncIntervalId, setSyncIntervalId] = useState(null);

  //timer
  useEffect(() => {
    let timer;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Stop the timer if the page is not visible (user switches tabs, minimizes, or opens another app)
        clearInterval(timer);
      } else if (!loadingQuestions.bool && loadingQuestions.started) {
        // Resume the timer when the page becomes visible again
        timer = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1); // Decrement the time without checking for zero
        }, 1000);
      }
    };

    if (
      !loadingQuestions.submit &&
      !loadingQuestions.bool &&
      loadingQuestions.started &&
      !document.hidden
    ) {
      // Start the timer only if the page is visible
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1); // Decrement the time without checking for zero
      }, 1000);
    }

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadingQuestions]);

  //update the time spent on the current question
  useEffect(() => {
    // When the currentQuestionId changes, store the end time for the previous question
    if (!currentQuestionDuration.relatedQuestionId) {
      setCurrentQuestionDuration((prevState) => ({
        ...prevState,
        relatedQuestionId: currentQuestionId,
      }));
    }
    if (
      currentQuestionDuration.relatedQuestionId &&
      currentQuestionDuration.startTime
    ) {
      const endTime = timeLeft;
      const duration = Math.round(currentQuestionDuration.startTime - endTime);

      setUserAns((prevState) => ({
        ...prevState,
        [currentQuestionDuration.relatedQuestionId]: {
          ...prevState[currentQuestionDuration.relatedQuestionId],
          time_spent:
            prevState[currentQuestionDuration.relatedQuestionId].time_spent +
            duration,
        },
      }));
      async function updateStorage() {
        if (await answerExists(currentQuestionDuration.relatedQuestionId)) {
          await updateAnswerField(
            currentQuestionDuration.relatedQuestionId,
            "time_spent",
            duration
          );
        }
      }
      updateStorage();
    }
    setCurrentQuestionDuration((prev) => ({
      ...prev,
      relatedQuestionId: currentQuestionId,
    }));
    setCurrentQuestionDuration((prev) => ({
      ...prev,
      startTime: timeLeft,
      endTime: null,
    }));
  }, [currentQuestionId]);

  //show the notification when time is up
  useEffect(() => {
    if (timeLeft < 0 && !ExtraTimeSpentMessageShown) {
      toast((t) => (
        <div className="flex gap-1 max-w-80 items-center">
          <span>
            <b>Hurry up!</b> Time is running out—finish strong.
          </span>
          <button
            onClick={() => {
              toast.dismiss();
            }}
            className="p-1 py-1 px-3 w-28 bg-blue-50 rounded-lg"
          >
            {"Okay :)"}
          </button>
        </div>
      ));
      setExtraTimeSpentMessageShown(true); // Set state to indicate the toast has been shown
    }
  }, [timeLeft, ExtraTimeSpentMessageShown]);

  useEffect(() => {
    console.log(userAns);
    if (currentQuestionId) {
      console.log("currentUserAns", userAns[currentQuestionId].touched);
    }
    // caluculte numbers for progress
    if (userAns) {
      setProgress((prevState) => ({
        ...prevState,
        done: Object.values(userAns).filter((answer) => answer.ans !== null)
          .length,
        touched: Object.values(userAns).filter((answer) => answer.touched)
          .length,
      }));
    }
  }, [userAns]);

  useEffect(() => {
    // Function to fetch the paper from the database
    async function fetchPaper() {
      try {
        setLoadingQuestions((prevState) => ({
          ...prevState,
          syncDraftData: true,
        }));
        const docRef = doc(db, "papers", paperId);
        const docSnap = await getDoc(docRef);

        const draftDataDoc = doc(
          db,
          "users",
          auth.currentUser.uid,
          "paper_draft_data",
          paperId
        );
        const draftDataDocSnap = await getDoc(draftDataDoc);
        const draftDocData = draftDataDocSnap.exists()
          ? draftDataDocSnap.data()
          : null;
        console.log("draftDataDocdata", draftDocData);

        setLoadingPaper(false);

        const updateStateAndStoreAnswer = (
          ans,
          touched,
          time_spent,
          answered_at,
          q_id
        ) => {
          setUserAns((prevState) => ({
            ...prevState,
            [q_id]: { ans, touched, time_spent, answered_at },
          }));

          storeAnswer({
            q_id,
            pp_id: docSnap.data().id,
            ans,
            touched,
            time_spent,
            answered_at,
          });
        };

        if (docSnap.exists()) {
          setPaper(docSnap.data());
          {
            /*if (!(await paperExists(docSnap.data().id))) {
            storePaper({ pp_id: docSnap.data().id, remain_time: timeLeft });
          } else {
            getPaper(docSnap.data().id).then((info) => {
              setTimeLeft(info.remain_time);
            });
          }*/
          }
          console.log("Fetched Paper:", docSnap.data());
          console.log(docSnap.data().id);

          // writing data into indexedDB
          //await deleteNonMatchingQuesRecords(docSnap.data().id);
          //await deleteNonMatchingAnsRecords(docSnap.data().id);
          setLoadingQuestions((prevState) => ({
            ...prevState,
            bool: true,
            started: false,
            current_no: 0,
            total_no: docSnap.data().q_ids.length,
          }));
          for (const q_id of docSnap.data().q_ids) {
            setLoadingQuestions((prev) => ({
              ...prev,
              current_no: docSnap.data().q_ids.indexOf(q_id),
            }));
            if (
              !(await questionExists(q_id)) ||
              !(await isSameVersion(docSnap.data().version, q_id))
            ) {
              console.log(
                "question doesn't exist or version is different",
                q_id,
                docSnap.data().version
              );
              const questionDocRef = doc(db, "questions", q_id);
              const questionDocSnap = await getDoc(questionDocRef);
              if (questionDocSnap.exists()) {
                let data = questionDocSnap.data();
                data["v"] = docSnap.data().version;
                await storeQuestion(data);
              }
            }
            const answerExistsFlag = await answerExists(q_id);
            const draftAnswer =
              draftDocData &&
              draftDocData.answers &&
              q_id in draftDocData.answers
                ? draftDocData.answers[q_id]
                : null;
            console.warn("draftAnswer", draftAnswer, q_id, answerExistsFlag);
            if (!answerExistsFlag && !draftDocData) {
              updateStateAndStoreAnswer(null, false, 0, null, q_id);
            } else if (!answerExistsFlag && draftAnswer) {
              updateStateAndStoreAnswer(
                draftAnswer.ans,
                draftAnswer.touched,
                draftAnswer.time_spent,
                draftAnswer.answered_at,
                q_id
              );
            } else if (answerExistsFlag && draftAnswer) {
              const existingAnswer = await getAnswer(q_id);
              const shouldUseDraft =
                draftAnswer.answered_at > existingAnswer.answered_at;

              if (shouldUseDraft) {
                updateStateAndStoreAnswer(
                  draftAnswer.ans,
                  draftAnswer.touched,
                  draftAnswer.time_spent,
                  draftAnswer.answered_at,
                  q_id
                );
              } else {
                setUserAns((prevState) => ({
                  ...prevState,
                  [q_id]: {
                    ans: existingAnswer.ans,
                    touched: existingAnswer.touched,
                    time_spent: existingAnswer.time_spent || 0,
                    answered_at: existingAnswer.answered_at,
                  },
                }));
              }
            } else if (answerExistsFlag) {
              const existingAnswer = await getAnswer(q_id);
              setUserAns((prevState) => ({
                ...prevState,
                [q_id]: {
                  ans: existingAnswer.ans,
                  touched: existingAnswer.touched,
                  time_spent: existingAnswer.time_spent || 0,
                  answered_at: existingAnswer.answered_at,
                },
              }));
            } else {
              updateStateAndStoreAnswer(null, false, 0, null, q_id);
            }
          }
          setLoadingQuestions((prevState) => ({
            ...prevState,
            bool: false,
            started: false,
            syncDraftData: false,
            current_no: docSnap.data().q_ids.length,
            total_no: docSnap.data().q_ids.length,
          }));
        } else {
          setPaperNotFound(true);
          console.error("No such document!");
        }
      } catch (e) {
        console.error("Error fetching document: ", e);
      }
    }
    console.log("running the fetchPaper function");

    fetchPaper();
  }, [paperId]);

  //sync data at the very first time of loading and set the timeleft from the sum of time spent on each question
  useEffect(() => {
    if (
      userAns &&
      Object.keys(userAns).length === 50 &&
      !loadingQuestions.syncedAt
    ) {
      console.log("synced for the very first time");
      syncDraftData();
      function sumTimeSpent(obj) {
        return Object.values(obj).reduce(
          (sum, item) => sum + (item.time_spent || 0),
          0
        );
      }
      const totalTimeSpent = sumTimeSpent(userAns);
      setTimeLeft(2 * 60 * 60 - totalTimeSpent);
    }
  }, [userAns]);

  useEffect(() => {
    async function fetchCurrentQuestion(currentQuestionId) {
      try {
        const question = await getQuestion(currentQuestionId);
        clearRadioButtons();
        if (userAns[currentQuestionId].ans !== null) {
          selectRadioButton(userAns[currentQuestionId].ans);
        }
        setCurrentQuestion(question);
        setUserAns((prevState) => ({
          ...prevState,
          [currentQuestionId]: {
            ...prevState[currentQuestionId],
            touched: true,
          },
        }));
        console.log(question);
        let html_q_title = DOMPurify.sanitize(processQuestionToHtml(String(question.q_title)));
        let html_ans1 = DOMPurify.sanitize(
          processQuestionToHtml(String(question.ans1))
        );
        let html_ans2 = DOMPurify.sanitize(
          processQuestionToHtml(String(question.ans2))
        );
        let html_ans3 = DOMPurify.sanitize(
          processQuestionToHtml(String(question.ans3))
        );
        let html_ans4 = DOMPurify.sanitize(
          processQuestionToHtml(String(question.ans4))
        );
        let html_ans5 = DOMPurify.sanitize(
          processQuestionToHtml(String(question.ans5))
        );
        setCurrentQuestionContent({
          title: html_q_title,
          ans1: html_ans1,
          ans2: html_ans2,
          ans3: html_ans3,
          ans4: html_ans4,
          ans5: html_ans5,
        });
        console.log("html_q_title", html_q_title);

        //scroll to the very top
        const element = document.getElementById("q-pan-holder");
        if (element) {
          element.scrollTop = 0;
        }
        console.log(question);
      } catch (e) {
        toast.error(`Error fetching question: ${e}`);
      }
    }
    if (currentQuestionId) {
      fetchCurrentQuestion(currentQuestionId);
    }
  }, [currentQuestionId]);

  useEffect(() => {
    // Select all 'pre' elements
    var preTags = document.querySelectorAll("pre");

    preTags.forEach((preTag) => {
      // Get the innerHTML and replace < and > characters
      var pattern = preTag.innerHTML;
      pattern = pattern.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      // Set the modified HTML back to the pre element
      preTag.innerHTML = pattern;
    });
  }, [currentQuestionContent]);

  useEffect(() => {
    console.log("currentqcontent", currentQuestionContent);
  }, [currentQuestionContent]);

  //update synced at
  useEffect(() => {
    if (loadingQuestions.syncedAt) {
      // Clear any existing interval before setting a new one
      if (syncIntervalId) {
        clearInterval(syncIntervalId);
      }

      // Set a new interval to update the minutesAgo state
      const intervalId = setInterval(() => {
        const diffInMinutes = Math.floor(
          (Date.now() - loadingQuestions.syncedAt) / (60 * 1000) // Fixed time conversion
        );
        setMinutesAgo(diffInMinutes);

        // Automatically clear the interval if minutesAgo exceeds 4
        if (diffInMinutes > 4) {
          clearInterval(intervalId);
          setSyncIntervalId(null); // Reset the state to indicate no interval is active
        }
      }, 60000); // Check every 10 seconds (10,000 ms)

      // Store the new interval ID in state so it can be cleared later
      setSyncIntervalId(intervalId);

      // Set the initial minutesAgo immediately
      const initialDiffInMinutes = Math.floor(
        (Date.now() - loadingQuestions.syncedAt) / (60 * 1000)
      );
      setMinutesAgo(initialDiffInMinutes);
    }

    // Cleanup function to clear the interval when the component unmounts or when syncedAt changes
    return () => {
      if (syncIntervalId) {
        clearInterval(syncIntervalId);
      }
    };
  }, [loadingQuestions.syncedAt]);

  useEffect(() => {
    console.log("createdAt", loadingQuestions.syncedAt, syncedMuntesAgo);
  }, [loadingQuestions.syncedAt, syncedMuntesAgo]);

  function startPaper() {
    setCurrentQuestionId(paper.q_ids[0]);
    setLoadingQuestions((prevState) => ({ ...prevState, started: true }));
  }

  const startOver = async () => {
    await deleteAnswersByPPId(paper.id);
    setUserAns((prevState) => {
      const updatedState = Object.keys(prevState).reduce((acc, key) => {
        acc[key] = {
          ...prevState[key],
          answered_at: null,
          ans: null,
          touched: false,
          time_spent: 0,
        };
        return acc;
      }, {});
      setTimeLeft(2 * 60 * 60);
      updateTimeLeftInPaper(paper.id, 2 * 60 * 60);
      return updatedState;
    });
    try {
      const draftDataDoc = doc(
        db,
        "users",
        auth.currentUser.uid,
        "paper_draft_data",
        paper.id
      );
      await deleteDoc(draftDataDoc);
    } catch (e) {
      toast.error("Error deleting draft data: ", e);
      console.error("Error deleting draft data: ", e.message);
    }
    setCurrentQuestionId(paper.q_ids[0]);
    setLoadingQuestions((prevState) => ({ ...prevState, started: true }));
  };

  useEffect(() => {
    if (
      !loadingPaper &&
      !loadingQuestions.bool &&
      !loadingQuestions.syncDraftData
    ) {
      if (timeLeft !== 0 && timeLeft % 900 === 0) {
        syncDraftData();
      }
    }
  }, [timeLeft]);

  const redirect = (link) => {
    window.location.href(link);
  };

  const jumpToQNo = (q_index) => {
    if (loadingQuestions.bool == false && loadingQuestions.started == true) {
      setCurrentQuestionId(paper.q_ids[q_index]);
    }
    if (loadingQuestions.bool) {
      toast.error("Questions are still loading. Please wait for a moment.");
    }
    if (!loadingQuestions.bool && !loadingQuestions.started) {
      toast((t) => (
        <div className="inline-flex gap-1 max-w-80 items-center">
          <span>
            <b>Let's go!</b> click on the start button to start doing the paper.
          </span>
          <button
            onClick={() => {
              toast.dismiss();
              startPaper();
            }}
            className="p-1 py-1 px-3 bg-blue-50 rounded-lg"
          >
            Start
          </button>
        </div>
      ));
    }
  };

  const jumpToNext = () => {
    const current_index = paper.q_ids.indexOf(currentQuestionId);
    if (currentQuestionId != paper.q_ids[paper.q_ids.length - 1]) {
      setCurrentQuestionId(paper.q_ids[current_index + 1]);
    }
  };

  const jumpToPrev = () => {
    const current_index = paper.q_ids.indexOf(currentQuestionId);
    if (!(current_index < 0)) {
      setCurrentQuestionId(paper.q_ids[current_index - 1]);
    }
  };

  const getSelectedRadioValue = () => {
    const selectedRadio = document.querySelector('input[name="ans"]:checked');
    if (selectedRadio) {
      return selectedRadio.id;
    }
    return null;
  };

  const handleRadioChange = async () => {
    const ansTime = Date.now();
    const selectedValue = getSelectedRadioValue();
    setUserAns((prevState) => ({
      ...prevState,
      [currentQuestionId]: {
        ...prevState[currentQuestionId],
        ans: selectedValue,
        answered_at: ansTime,
      },
    }));
    if (await answerExists(currentQuestionId)) {
      await updateAnswerField(currentQuestionId, "ans", selectedValue);
      await updateAnswerField(currentQuestionId, "touched", true);
      await updateAnswerField(currentQuestionId, "answered_at", ansTime);
    } else {
      storeAnswer({
        q_id: currentQuestionId,
        pp_id: paper.id,
        ans: selectedValue,
        touched: true,
        answered_at: Date.now(),
      });
    }
    if (currentQuestionDuration.startTime) {
      const endTime = timeLeft;
      const duration = Math.round(currentQuestionDuration.startTime - endTime);
      setUserAns((prevState) => ({
        ...prevState,
        [currentQuestionId]: {
          ...prevState[currentQuestionId],
          time_spent: prevState[currentQuestionId].time_spent + duration,
        },
      }));
      async function updateStorage() {
        if (await answerExists(currentQuestionId)) {
          await updateAnswerField(currentQuestionId, "time_spent", duration);
        }
      }
      updateStorage();
      setCurrentQuestionDuration((prev) => ({
        ...prev,
        startTime: timeLeft,
        endTime: null,
      }));
    }
    updateTimeLeftInPaper(paper.id, timeLeft);
    console.log("Selected Radio Button ID:", selectedValue);
  };

  const clearRadioButtons = () => {
    const radioButtons = document.querySelectorAll('input[name="ans"]');
    radioButtons.forEach((radio) => {
      radio.checked = false;
    });
  };

  const selectRadioButton = (value) => {
    if (value !== null) {
      const radioToSelect = document.getElementById(value);
      if (radioToSelect) {
        radioToSelect.checked = true;
      }
    }
  };

  const handleSubmit = async () => {
    if (loadingQuestions.bool) {
      toast.error("Questions are still loading. Please wait for a moment.");
    } else if (!loadingQuestions.started) {
      startPaper();
      startPaper();
    } else if (progress.done < 30) {
      toast((t) => (
        <span className="inline-flex items-start -m-0 gap-2">
          <LuInfo className="min-w-4 mt-1" />
          <div>
            <b>You're almost there!</b> Please{" "}
            <b>complete at least 30 questions</b> before submitting the paper.
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-slate-100 p-1 rounded-md ml-2"
            >
              Dismiss
            </button>
          </div>
        </span>
      ));
      if (
        loadingQuestions.syncedAt &&
        Date.now() - loadingQuestions.syncedAt > 10000
      ) {
        syncDraftData();
      }
    } else {
      //if already submmiting
      if (loadingQuestions.submit) {
        toast("Already submitting the paper. Please wait for a moment.");
      } else {
        setLoadingQuestions((prevState) => ({
          ...prevState,
          submit: true,
        }));
        try {
          await deleteAnswersByPPId(paper.id);
          const submitAnswers = httpsCallable(
            functions,
            "handelSubmitPastPaperPra"
          );
          const userId = auth.currentUser.uid; // change `userID` to `userId`
          const ppId = paper.id; // change `pp_id` to `ppId`
          const userAnswers = userAns;
          const result = await submitAnswers({ userId, ppId, userAnswers });
          console.log("Function result:", result.data);
        } catch (error) {
          setLoadingQuestions((prevState) => ({
            ...prevState,
            submit: false,
          }));
          toast.error("Error calling function:", error.message);
          console.error("Error calling function:", error);
        }
      }
    }
  };

  const syncDraftData = async () => {
    setLoadingQuestions((prevState) => ({
      ...prevState,
      syncDraftData: true,
    }));

    try {
      if (userAns && Object.keys(userAns).length === 50) {
        // Check if all answers are null
        const allAnswersNull = Object.values(userAns).every(
          (answer) => answer.ans === null
        );

        // If all answers are null, exit the function early
        if (allAnswersNull) {
          setLoadingQuestions((prevState) => ({
            ...prevState,
            syncDraftData: false,
            syncedAt: Date.now(),
          }));
          return;
        }

        const draftDataDoc = doc(
          db,
          "users",
          auth.currentUser.uid,
          "paper_draft_data",
          paper.id
        );
        const draftDataDocSnap = await getDoc(draftDataDoc);
        if (draftDataDocSnap.exists()) {
          console.log("draft data exists: ", draftDataDocSnap.data());
          const draftData = draftDataDocSnap.data();
          if (draftData.answers) {
            for (const q_id of Object.keys(draftData.answers)) {
              if (
                draftData.answers[q_id].answered_at &&
                draftData.answers[q_id].answered_at > userAns[q_id].answered_at
              ) {
                setUserAns((prevState) => ({
                  ...prevState,
                  [q_id]: {
                    ...prevState[q_id],
                    ans: draftData.answers[q_id].ans,
                    touched: draftData.answers[q_id].touched,
                    time_spent: draftData.answers[q_id].time_spent,
                    answered_at: draftData.answers[q_id].answered_at,
                  },
                }));
                storeAnswer({
                  q_id: q_id,
                  pp_id: paper.id,
                  ans: draftData.answers[q_id].ans,
                  touched: draftData.answers[q_id].touched,
                  time_spent: draftData.answers[q_id].time_spent,
                  answered_at: draftData.answers[q_id].answered_at,
                });
              }
            }
          }
        }
        await setDoc(draftDataDoc, { answers: userAns });
      }

      setLoadingQuestions((prevState) => ({
        ...prevState,
        syncDraftData: false,
        syncedAt: Date.now(),
      }));
    } catch (e) {
      setLoadingQuestions((prevState) => ({
        ...prevState,
        syncDraftData: false,
        syncedAt: false,
      }));
      toast.error(`Error syncing draft data: ${e.message}`);
    }
  };

  //update the prgress bar
  useEffect(() => {
    const updateProgress = () => {
      if (paper.q_ids) {
        const progressPercent = Math.abs(
          (progress.done / paper.q_ids.length) * 100
        );
        console.log("progress ", progressPercent);

        // Update the CSS variable directly
        document.documentElement.style.setProperty(
          "--progress",
          progressPercent
        );
      }
    };

    updateProgress();
  }, [progress]);

  return (
    <div>
      {(loadingPaper || paperNotFound || !paperId) && (
        <div className="def-holder not-found-holder">
          <div className="def-child not-found">
            <div className="navigation">
              <a href="/">
                <HiOutlineHome />
              </a>{" "}
              / <a href="/past-paper">past-paper</a> /
            </div>
            {loadingPaper && (
              <ErrorWithOllie
                loading={true}
                loadingTitle="Checking info"
              ></ErrorWithOllie>
            )}
            {paperNotFound && (
              <ErrorWithOllie
                title="404"
                redirectToHome={true}
                action={() => {
                  redirect("/");
                }}
              >
                paper ID: {paperId} couldn't find.
              </ErrorWithOllie>
            )}
          </div>
        </div>
      )}
      {!loadingPaper && !paperNotFound && (
        <div className="def-holder pp-pra-holder">
          <div className="w-full max-w-7xl pp-pra">
            <div className="dashboard">
              <div className="left">
                <button className="back-btn">
                  <IoMdArrowRoundBack />
                </button>
                <div className="logo">
                  <img
                    className="def-logo-img w-8 duration-300"
                    src="/main-logo.svg"
                  />
                  <p className="def-logo-txt">EDUBRAIN</p>
                </div>
                <div className="pp-title">
                  <h1>{paper && paper.title}</h1>
                  <p>{paper && paper.sub_id}</p>
                </div>
                <img
                  className="obj-img"
                  src={floatingObjsImg}
                  alt="floating objects"
                />
              </div>
              <div className="right">
                <div
                  className={`count-down ${
                    timeLeft < 0 ? "bg-red-100" : "bg-white"
                  }`}
                >
                  <div>
                    <GoClock />
                  </div>
                  <div>
                    <p>
                      {timeLeft < 0 ? "Time Beyond Limit" : "Time remaining"}
                    </p>
                    <p className="time">
                      {/*timeLeft < 0 ? "-" : ""*/}
                      {Math.floor(Math.abs(timeLeft) / 3600)
                        .toString()
                        .padStart(2, "0")}
                      :
                      {Math.floor((Math.abs(timeLeft) % 3600) / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(Math.abs(timeLeft) % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                </div>
                <button className="submit-btn" onClick={handleSubmit}>
                  {loadingQuestions.bool || loadingQuestions.submit ? (
                    <div className="def-loading-svg p-1">
                      <AiOutlineLoading3Quarters />
                    </div>
                  ) : (
                    <>
                      {!loadingQuestions.bool && !loadingQuestions.started
                        ? progress.done > 0
                          ? "Resume"
                          : "Start"
                        : "Submit"}
                    </>
                  )}
                </button>
                <div className="profile">
                  <img src={auth.currentUser.photoURL} />
                </div>
                <div className="info-holder">
                  <div className="mood">
                    {loadingQuestions.submit ? (
                      <>
                        <RiSendPlaneLine /> Submitting Data
                      </>
                    ) : (
                      <>
                        {loadingQuestions.syncDraftData ? (
                          <div className="flex def-loading-svg">
                            <AiOutlineLoading3Quarters />
                          </div>
                        ) : !loadingQuestions.syncedAt ? (
                          <MdComputer />
                        ) : syncedMuntesAgo > 4 ? (
                          <MdComputer />
                        ) : (
                          <IoCloudOutline />
                        )}{" "}
                        {loadingQuestions.syncDraftData
                          ? "synchronizing data"
                          : !loadingQuestions.syncedAt
                          ? "Working Offline"
                          : syncedMuntesAgo > 4
                          ? "Working Offline"
                          : `synced ${syncedMuntesAgo == 0 ? "now" : ""}
                          ${syncedMuntesAgo == 1 ? "a min ago" : ""}
                          ${
                            syncedMuntesAgo > 1
                              ? `${syncedMuntesAgo} min ago`
                              : ""
                          }`}
                      </>
                    )}
                    <p></p>
                  </div>
                  {!loadingQuestions.submit ||
                    (!loadingQuestions.syncDraftData &&
                      (syncedMuntesAgo > 4 || !loadingQuestions.syncedAt) && (
                        <button onClick={syncDraftData}>
                          <MdOutlineCloudSync />
                        </button>
                      ))}
                </div>
              </div>
            </div>
            <div className="det-holder">
              {loadingQuestions.submit ? (
                <div className="det-child sub-progress">
                  <div className="submit-progress-holder">
                    <div className="submit-progress-child">
                      <img
                        src="/img/objects/octopus-on-the-coutch.png"
                        className="img-spaceship max-w-64 w-full drop-shadow-xl text-center select-none"
                      />
                      <h1>Finalizing your answers.</h1>
                      <p className="text-center">
                        Take it easy! We're processing and storing your
                        answers—just hang tight for a moment.
                      </p>
                      <div className="loading-progress">
                        <div className="def-loading-svg">
                          <AiOutlineLoading3Quarters />
                        </div>
                        Submitting
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="det-child">
                  <div className="overview-pan">
                    <div className="overview">
                      <div className="progress-bar">
                        <svg
                          id="progressBar"
                          width="60"
                          height="60"
                          viewBox="0 0 60 60"
                          className="circular-progress"
                        >
                          <circle className="bg"></circle>
                          <circle className="fg"></circle>
                        </svg>
                        <div className="progress-txt">
                          {progress.done}
                          <span>/{paper.q_ids?.length}</span>
                        </div>
                      </div>
                      <div className="status">
                        <div className="stu-det">
                          <div className="sm-q done"></div>
                          {progress.done} questions completed
                        </div>
                        <div className="stu-det">
                          <div className="sm-q skipped"></div>
                          {progress.touched - progress.done} questions skipped
                        </div>
                        <div className="stu-det">
                          <div className="sm-q not-done"></div>
                          {paper.q_ids.length - progress.touched} questions
                          untouched
                        </div>
                      </div>
                    </div>
                    <div className="q-nums-holder">
                      <div className="bg-slate-100 w-full rounded-md overflow-hidden p-1 py-0 lg:py-2">
                        <div className="q-nums-wrap">
                          <div className="q-nums">
                            {paper.q_ids.map((q_id, index) => (
                              <div
                                onClick={() => jumpToQNo(index)}
                                className={`quection ${
                                  currentQuestionId &&
                                  userAns[paper.q_ids[index]].touched
                                    ? "skipped"
                                    : ""
                                } ${
                                  currentQuestionId &&
                                  userAns[paper.q_ids[index]].ans != null
                                    ? "done"
                                    : ""
                                }
                              `}
                                key={index}
                              >
                                {Math.abs(index + 1)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="q-pan-holder" className="q-pan-holder">
                    <div className="question-pan">
                      {(loadingQuestions.bool || !loadingQuestions.started) && (
                        <div className="download-q">
                          <img
                            src="/img/objects/octopus-on-the-coutch.png"
                            className="img-ollie"
                          />
                          {loadingQuestions.bool && (
                            <div className="w-full flex flex-col items-center text-center">
                              <h1>Hold tight!</h1>
                              <p className="text-center">
                                Ollie's downloading quections...
                              </p>
                              <div className="loading-progress">
                                <div className="def-loading-svg">
                                  <AiOutlineLoading3Quarters />
                                </div>
                                Downloading (
                                {loadingQuestions.total_no != 0
                                  ? Math.round(
                                      Math.abs(
                                        (loadingQuestions.current_no /
                                          loadingQuestions.total_no) *
                                          100
                                      )
                                    )
                                  : ""}
                                %)
                              </div>
                            </div>
                          )}
                          {!loadingQuestions.bool &&
                            !loadingQuestions.started && (
                              <div className="w-full flex flex-col text-center items-center">
                                <h1>
                                  {progress.done > 0
                                    ? "Start from where you left off?"
                                    : "Let's Go!"}{" "}
                                </h1>
                                <p>
                                  {progress.done > 0
                                    ? 'It looks like you have an unfinished paper. If you\'d like to continue with your unsaved progress, click "Resume". Otherwise, click "Start New" to begin a new paper.'
                                    : "Everything is ready to go! So do you?"}
                                </p>
                                <div className="inline-flex gap-1 flex-wrap items-center justify-center">
                                  <button
                                    onClick={startPaper}
                                    className="p-1 px-3 bg-blue-50 rounded-lg mt-3"
                                  >
                                    {progress.done > 0 ? "Resume" : "Start"}
                                  </button>
                                  {progress.done > 0 && (
                                    <button
                                      onClick={startOver}
                                      className="p-1 px-3 bg-blue-50 rounded-lg mt-3"
                                    >
                                      Start New
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                      {!loadingQuestions.bool && loadingQuestions.started && (
                        <div>
                          <div className="q-num-des">
                            <div className="q-num">{currentQuestion.no}</div>
                            <div className="q-des">
                              question
                              <br />
                              out of {paper.q_ids.length}
                            </div>
                          </div>
                          <div className="q-txt">
                            {parseHtml(
                              typeof currentQuestionContent?.title === "string"
                                ? currentQuestionContent.title
                                : ""
                            )}
                          </div>
                          <div className="q-opts">
                            <label className="q-opt">
                              <input
                                id="1"
                                name="ans"
                                type="radio"
                                onChange={handleRadioChange}
                              />
                              <span className="ans-num" for="1">
                                <p>1</p>
                              </span>
                              <label className="ans-lab" for="1">
                                <div>
                                  {parseHtml(currentQuestionContent?.ans1 || "")}
                                </div>
                              </label>
                            </label>
                            <label className="q-opt">
                              <input
                                id="2"
                                name="ans"
                                type="radio"
                                onChange={handleRadioChange}
                              />
                              <label className="ans-num" for="2">
                                <p>2</p>
                              </label>
                              <label className="ans-lab" for="2">
                                <div>
                                  {parseHtml(currentQuestionContent?.ans2 || "")}
                                </div>
                              </label>
                            </label>
                            <label className="q-opt">
                              <input
                                id="3"
                                name="ans"
                                type="radio"
                                onChange={handleRadioChange}
                              />
                              <label className="ans-num" for="3">
                                <p>3</p>
                              </label>
                              <label className="ans-lab" for="3">
                                <div>
                                  {parseHtml(currentQuestionContent?.ans3 || "")}
                                </div>
                              </label>
                            </label>
                            <label className="q-opt">
                              <input
                                id="4"
                                name="ans"
                                type="radio"
                                onChange={handleRadioChange}
                              />
                              <label className="ans-num" for="4">
                                <p>4</p>
                              </label>
                              <label className="ans-lab" for="4">
                                <div>
                                  {parseHtml(currentQuestionContent?.ans4 || "")}
                                </div>
                              </label>
                            </label>
                            <label className="q-opt">
                              <input
                                id="5"
                                name="ans"
                                type="radio"
                                onChange={handleRadioChange}
                              />
                              <label className="ans-num" for="5">
                                <p>5</p>
                              </label>
                              <label className="ans-lab" for="5">
                                <div>
                                  {parseHtml(currentQuestionContent?.ans5 || "")}
                                </div>
                              </label>
                            </label>
                            <div className="tags"></div>
                            <div className="ac-buttons">
                              {!paper.q_ids.indexOf(currentQuestionId) == 0 && (
                                <button
                                  onClick={jumpToPrev}
                                  className="prev-btn"
                                >
                                  Prev
                                </button>
                              )}
                              {currentQuestionId !=
                                paper.q_ids[paper.q_ids.length - 1] && (
                                <button
                                  onClick={jumpToNext}
                                  className="next-btn"
                                >
                                  Next
                                </button>
                              )}
                              {currentQuestionId ==
                                paper.q_ids[paper.q_ids.length - 1] && (
                                <button
                                  className="next-btn"
                                  onClick={handleSubmit}
                                >
                                  Submit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Toaster position="bottom-left" reverseOrder={false} />
    </div>
  );
}
``;
