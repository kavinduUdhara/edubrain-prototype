import { openDB } from 'idb';

const getDB = async () => {
  if (typeof window !== "undefined") {
    return openDB('question-store', 1, {
      upgrade(db) {
        db.createObjectStore('questions', { keyPath: 'q_id' });
        const usr_ans_db = db.createObjectStore('usr_answers', { keyPath: 'q_id' });
        usr_ans_db.createIndex('pp_id', 'pp_id');
        db.createObjectStore('paper', { keyPath: 'pp_id' });
      },
    });
  } else {
    throw new Error("IndexedDB is not available in this environment");
  }
};

export const getQuestion = async (id) => {
  const db = await getDB();
  return db.transaction('questions').objectStore('questions').get(id);
};

export const getAnswer = async (id) => {
  const db = await getDB();
  return db.transaction('usr_answers').objectStore('usr_answers').get(id);
};

export const getPaper = async (id) => {
  const db = await getDB();
  return db.transaction('paper').objectStore('paper').get(id);
}

export const storeQuestion = async (question) => {
  const db = await getDB();
  return db.transaction('questions', 'readwrite').objectStore('questions').put(question);
};

export const storeAnswer = async (question) => {
  const db = await getDB();
  return db.transaction('usr_answers', 'readwrite').objectStore('usr_answers').put(question);
};

export const storePaper = async (paper) => {
  const db = await getDB();
  return db.transaction('paper', 'readwrite').objectStore('paper').put(paper);
};

export const updateTimeLeftInPaper = async (pp_id, timeLeft) => {
  const db = await getDB();

  const transaction = db.transaction('paper', 'readwrite');
  const store = transaction.objectStore('paper');

  const paper = await store.get(pp_id);

  if (paper) {
    paper.remain_time = timeLeft;
    await store.put(paper);
    console.log(`Updated timeLeft (${timeLeft} seconds) for paper ID ${pp_id}.`);
  } else {
    console.error(`Paper with ID ${pp_id} not found.`);
  }
};

export const updateAnswerField = async (questionId, fieldName, fieldValue) => {
  const db = await getDB();
  const transaction = db.transaction('usr_answers', 'readwrite');
  const objectStore = transaction.objectStore('usr_answers');

  const existingAnswer = await objectStore.get(questionId);

  if (existingAnswer) {
    existingAnswer[fieldName] = fieldValue;
    await objectStore.put(existingAnswer);
  } else {
    const newAnswer = { id: questionId, [fieldName]: fieldValue };
    await objectStore.put(newAnswer);
  }

  return transaction.complete;
};

export const deleteNonMatchingQuesRecords = async (targetPpId) => {
  const db = await getDB();
  const tx = db.transaction('questions', 'readwrite');
  const store = tx.objectStore('questions');

  let cursor = await store.openCursor();

  while (cursor) {
    const record = cursor.value;
    if (record.pp_id !== targetPpId) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }

  await tx.done;
};

export const deleteNonMatchingAnsRecords = async (targetPpId) => {
  const db = await getDB();
  const tx = db.transaction('usr_answers', 'readwrite');
  const store = tx.objectStore('usr_answers');

  let cursor = await store.openCursor();

  while (cursor) {
    const record = cursor.value;
    if (record.pp_id !== targetPpId) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }

  await tx.done;
};

export const deleteAnswersByPPId = async (pp_id) => {
  const db = await getDB();

  const transaction = db.transaction('usr_answers', 'readwrite');
  const store = transaction.objectStore('usr_answers');
  
  const index = store.index('pp_id');
  
  const keys = await index.getAllKeys(pp_id);
  
  keys.forEach(async (key) => {
    await store.delete(key);
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      console.log(`Records with pp_id ${pp_id} have been deleted.`);
      resolve();
    };
    transaction.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export const questionExists = async (q_id) => {
  const db = await getDB();
  const question = await db.transaction('questions').objectStore('questions').get(q_id);
  return question !== undefined;
};

export const isSameVersion = async (v, q_id) => {
  const db = await getDB();
  const question = await db.get('questions', q_id);
  return question ? question.v === v : false;
};

export const answerExists = async (q_id) => {
  const db = await getDB();
  const question = await db.transaction('usr_answers').objectStore('usr_answers').get(q_id);
  return question !== undefined;
};

export const paperExists = async (pp_id) => {
  const db = await getDB();
  const paper = await db.transaction('paper').objectStore('paper').get(pp_id);
  return paper !== undefined;
};
