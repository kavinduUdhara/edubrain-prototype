"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

("use client");
import "./past-paper.css";
import { LuListFilter, LuSearch, LuNewspaper } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineCloudSync } from "react-icons/md";
import { MdFilterListOff, MdOutlineDeleteOutline } from "react-icons/md";
import { LuInfo } from "react-icons/lu";
import { SiGoogleanalytics } from "react-icons/si";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { auth, db } from "@/firebase";
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  limit,
  orderBy,
  getDocs,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { fetchPapers } from "../paperPractice/PastPaperFunc";
import ErrorWithOllie from "@/components/ErrorWithOllie/ErrorWithOllie";

export function PaperListPopUp({ children }) {
  const [filter, setFilter] = useState({
    opned: false,
    medium: "e",
    year: null,
    searchKey: null,
  });
  const [filterMoreOptionsOpened, setFilterMoreOptionsOpened] = useState({
    medium: false,
    year: false,
  });
  const [filterYearOptions, setFilterYearOptions] = useState([]);
  const [currentPPId, setCurrentPPId] = useState(null);
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [papersLoading, setPapersLoading] = useState(true);
  const [papersMoreInfo, setPapersMoreInfo] = useState({});
  const [papersMoreInfoLoaded, setPapersMoreInfoLoaded] = useState({});
  const [loadingEvenMoreInfo, setLoadingEvenMoreInfo] = useState(false);
  const [currentPPIdCacheExists, setCurrentPPIdCacheExists] = useState(false);

  useEffect(() => {
    console.log(papersMoreInfo);
  }, [papersMoreInfo]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, years] = await fetchPapers(); // Await the result
        setPapers(data);
        setFilteredPapers(papers); // Assuming you meant to use `data` here
        setFilterYearOptions(years);
        setPapersLoading(false);
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentPPId) {
      const fetchMoreInfo = async () => {
        try {
          const paperAttemptsSummaryRef = collection(
            db,
            "paper_attempts_summary"
          );
          const q_without_limit = query(
            paperAttemptsSummaryRef,
            where("pp_id", "==", currentPPId),
            where("user_id", "==", auth.currentUser.uid),
            orderBy("timestamp", "desc")
          );
          const countSnapshot = await getCountFromServer(q_without_limit);
          const count = countSnapshot.data().count;

          setPapersMoreInfoLoaded((prev) => ({
            ...prev,
            [currentPPId]: { count, loaded: false },
          }));

          const q = query(
            paperAttemptsSummaryRef,
            where("pp_id", "==", currentPPId),
            where("user_id", "==", auth.currentUser.uid),
            orderBy("timestamp", "desc"),
            limit(3)
          );
          const paperAttemptsSummarySnap = await getDocs(q);
          const paperAttemptsSummaryData = paperAttemptsSummarySnap.docs.map(
            (doc) => ({
              id: doc.id, // Get the document ID
              ...doc.data(), // Spread the document data
            })
          );

          setPapersMoreInfo((prev) => ({
            ...prev,
            [currentPPId]: paperAttemptsSummaryData,
          }));

          setPapersMoreInfoLoaded((prev) => ({
            ...prev,
            [currentPPId]: { count, loaded: true },
          }));
        } catch (error) {
          toast.error(`Error fetching more info: ${error.message}`);
          console.error("Error fetching more info:", error);
        }
      };

      if (!papersMoreInfoLoaded[currentPPId]) {
        fetchMoreInfo();
      }
      const checkPaperExists = async () => {
        const exists = await paperExists(currentPPId);
        setCurrentPPIdCacheExists(exists);
      };
      checkPaperExists();
    }
  }, [currentPPId]);

  useEffect(() => {
    applyFilter();
  }, [filter, papers]);

  const applyFilter = () => {
    const { medium, year, searchKey } = filter;

    console.log("Applying filter", medium, year);

    const filtered = papers.filter((paper) => {
      const mediumMatches = medium ? paper.m === medium : true;
      const yearMatches = year ? paper.yr === year : true;
      const searchKeyMatches = searchKey
        ? paper.title.toLowerCase().includes(searchKey.toLowerCase())
        : true;

      return mediumMatches && yearMatches && searchKeyMatches;
    });

    setFilteredPapers(filtered);
  };

  const toogleFilter = () =>
    setFilter((prev) => ({ ...prev, opned: !prev.opned }));

  const handleClearFilters = () => {
    setFilter((prev) => ({
      ...prev,
      year: null,
      searchKey: "",
    }));
  };

  const handelMediumChange = (medium) =>
    setFilter((prev) => ({ ...prev, medium: medium }));

  const handleToogleOptList = (opt) => {
    setFilterMoreOptionsOpened((prev) => {
      const newFilter = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === opt ? !prev[key] : false;
        return acc;
      }, {});
      return newFilter;
    });
  };

  const handleYearOptChange = (year) => {
    setFilter((prev) => ({ ...prev, year }));
    handleToogleOptList("year");
  };

  const handleMoreInfo = (pp_id) =>
    setCurrentPPId((prev) => (prev === pp_id ? null : pp_id));

  const handleLoadEvenMoreInfo = async () => {
    setLoadingEvenMoreInfo(true);
    try {
      const paperAttemptsSummaryRef = collection(db, "paper_attempts_summary");
      const lastTimestamp =
        papersMoreInfo[currentPPId]?.[papersMoreInfo[currentPPId].length - 1]
          ?.timestamp;
      const q = query(
        paperAttemptsSummaryRef,
        where("pp_id", "==", currentPPId),
        where("user_id", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(3),
        startAfter(lastTimestamp)
      );
      const paperAttemptsSummarySnap = await getDocs(q);
      const paperAttemptsSummaryData = paperAttemptsSummarySnap.docs.map(
        (doc) => ({
          id: doc.id, // Get the document ID
          ...doc.data(), // Spread the document data
        })
      );
      setPapersMoreInfo((prev) => ({
        ...prev,
        [currentPPId]: [
          ...(prev[currentPPId] || []),
          ...paperAttemptsSummaryData,
        ],
      }));
    } catch (error) {
      console.error("Error loading even more info:", error);
    } finally {
      setLoadingEvenMoreInfo(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Select a past paper to continue</DrawerTitle>
            <DrawerDescription>
              We have very limited papers in our <span>prototype</span>
            </DrawerDescription>
          </DrawerHeader>
          <div className="paper-list-holder">
            {!papersLoading && filteredPapers.length == 0 && (
              <ErrorWithOllie
                title="No Matches Found :("
                clearFilter={true}
                action={handleClearFilters}
              >
                Ollie couldn’t find the match you’re looking for. Try adjusting
                your filters or searching again.
              </ErrorWithOllie>
            )}
            <div className="paper-list">
              {papersLoading && (
                <div className="flex flex-col">
                  <div className="paper-holder">
                    <div className="paper">
                      <div className="paper-info">
                        <div className="paper-icon">
                          <LuNewspaper />
                        </div>
                        <div className="paper-title">
                          <div className="def-loading-box bg-slate-100 w-36 h-6"></div>
                        </div>
                        <div className="paper-id def-loading-box w-20 h-4"></div>
                        <div className="paper-year def-loading-box w-10 h-4"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-100 inline-flex items-center w-fit self-center gap-2 p-1 px-2 rounded-full my-2">
                    <div className="def-loading-svg">
                      <AiOutlineLoading3Quarters />
                    </div>{" "}
                    Loading data
                  </div>
                </div>
              )}
              {!papersLoading &&
                papers &&
                filteredPapers.map((paper) => {
                  return (
                    <div
                      className={`paper-holder ${
                        currentPPId == paper.key ? "active" : ""
                      }`}
                    >
                      <button
                        onClick={() => {
                          window.location.href = `/paper-practice/${paper.pp_id}`;
                        }}
                        className={`paper ${
                          currentPPId == paper.key ? "active" : ""
                        }`}
                      >
                        <div className="paper-info">
                          <div className="paper-icon">
                            <LuNewspaper />
                          </div>
                          <div className="paper-title">{paper.title}</div>
                          <div className="paper-id">{paper.sub_id}</div>
                          <div className="paper-year">{paper.yr}</div>
                        </div>
                        <div className="paper-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent this button click from navigating
                              handleMoreInfo(paper.key);
                            }}
                            className={`${
                              currentPPId == paper.key ? "active" : ""
                            }`}
                          >
                            <IoIosArrowDown />
                          </button>
                        </div>
                      </button>

                      <div
                        className={`more-info ${
                          currentPPId == paper.key ? "active" : ""
                        }`}
                      >
                        {!papersMoreInfoLoaded[paper.key] && (
                          <div className="attempts">
                            <div className="vertical-line"></div>
                            <div className="count">
                              <div className="count-val">0_0 </div>
                              <div className="count-title def-loading-box w-24 h-5 bg-slate-200"></div>
                            </div>
                            <div className="attempt flex items-center">
                              <div className="count-val">
                                <p>xx</p>
                              </div>
                              <div className="more-data">
                                <div className="attempt-date def-loading-box h-3 w-20 bg-slate-200"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        {papersMoreInfoLoaded[paper.key] &&
                          (!papersMoreInfoLoaded[paper.key].count ||
                            papersMoreInfoLoaded == 0) && (
                            <div className="no-history w-full px-4">
                              <div className="profile w-full">
                                <div className="flex flex-col w-full gap-1">
                                  <div className="message">
                                    You haven't done this paper before.
                                  </div>
                                  <div className="action-btn self-end">
                                    <button
                                      onClick={() => {
                                        window.location.href = `/paper-practice/${paper.pp_id}`;
                                      }}
                                    >
                                      Start Now
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        {papersMoreInfoLoaded[paper.key] &&
                          papersMoreInfoLoaded[paper.key].count > 0 && (
                            <div className="attempts">
                              <div className="vertical-line"></div>
                              <div className="count">
                                <div className="count-val">
                                  {papersMoreInfoLoaded[paper.key].count}
                                </div>
                                <div className="count-title">Attempts</div>
                              </div>
                              {/*paperexists */}
                              {currentPPIdCacheExists && (
                                <div className="attempt">
                                  <div className="count-val">
                                    <p>n</p>
                                  </div>
                                  <div className="more-data">
                                    <div className="attempt-date">
                                      20 Aug 2024
                                    </div>
                                    <div className="dot"></div>
                                    <p>Not submitted</p>
                                    <div className="dot"></div>
                                    <div className="attempt-actions">
                                      <button>
                                        <MdOutlineDeleteOutline /> Delete
                                      </button>
                                      <button>
                                        <MdOutlineCloudSync /> Sync Data
                                      </button>
                                      <button className="delete">
                                        <LuInfo />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {papersMoreInfo[paper.key] &&
                                Array.isArray(papersMoreInfo[paper.key]) &&
                                papersMoreInfo[paper.key].map(
                                  (attempt, att_key) => (
                                    <div className="attempt" key={att_key}>
                                      <div className="count-val">
                                        <p>
                                          {papersMoreInfoLoaded[paper.key]
                                            .count - att_key}
                                        </p>
                                      </div>
                                      <div className="more-data">
                                        <div className="attempt-date">
                                          {new Date(
                                            attempt.timestamp.seconds * 1000
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </div>
                                        <div className="dot"></div>
                                        <div className="attempt-score">
                                          <div className="progress-bar">
                                            <div
                                              className="progress"
                                              style={{
                                                width: `${attempt.score * 2}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <p>{attempt.score * 2}%</p>
                                        </div>
                                        <div className="dot"></div>
                                        <div className="attempt-actions">
                                          <button
                                            onClick={() => {
                                              window.location.href = `/paper-attempt/${attempt.id}`;
                                            }}
                                          >
                                            <SiGoogleanalytics /> Analytics{" "}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              {loadingEvenMoreInfo && (
                                <div className="attempt flex items-center">
                                  <div className="count-val">
                                    {papersMoreInfo[paper.key] &&
                                      Array.isArray(
                                        papersMoreInfo[paper.key]
                                      ) && (
                                        <p>
                                          {papersMoreInfoLoaded[paper.key]
                                            .count -
                                            papersMoreInfo[paper.key].length}
                                        </p>
                                      )}
                                  </div>
                                  <div className="more-data">
                                    <div className="attempt-date def-loading-box h-3 w-20 bg-slate-200"></div>
                                  </div>
                                </div>
                              )}
                              {papersMoreInfo[paper.key] &&
                                Array.isArray(papersMoreInfo[paper.key]) &&
                                papersMoreInfoLoaded[paper.key].count >
                                  papersMoreInfo[paper.key].length && (
                                  <div
                                    className="view-more"
                                    onClick={handleLoadEvenMoreInfo}
                                  >
                                    <div className="left-side">
                                      <button>
                                        <IoIosArrowDown />
                                      </button>
                                    </div>
                                    <div className="right-side">
                                      <button>View More</button>
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              {!papersLoading &&
                papers &&
                (filter.year || filter.searchKey) &&
                filteredPapers.length != 0 && (
                  <div className="text-sm mt-5 flex gap-3 items-center px-3 flex-wrap">
                    <p>
                      filters: {"{"}
                      {filter.year ? `year: ${filter.year}` : ""}
                      {filter.year && filter.searchKey ? ", " : ""}
                      {filter.searchKey ? `keyword: ${filter.searchKey}` : ""}
                      {"}"}
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="flex gap-2 items-center bg-blue-50 bg-opacity-50 shadow-sm p-1 px-2 rounded-md"
                    >
                      <MdFilterListOff /> Clear Filters
                    </button>
                  </div>
                )}
            </div>
          </div>
          {/* <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter> */}
          <div className="mb-10"></div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
