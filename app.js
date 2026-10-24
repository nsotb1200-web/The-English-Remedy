(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const activityPanel = $("#activity-panel");
  const activityTitle = $("#activity-title");
  const activitySubtitle = $("#activity-subtitle");
  const toast = $("#toast");
  let selectedSkill = "";
  let selectedLevel = "A1";
  let currentQuestion = 0;
  let answered = false;
  let vocabIndex = 0;
  let toastTimer;

  // Original demonstration content for interface testing only; not sourced from KAU textbooks.
  const demos = {
    listening: {
      A1: {title:"A simple clinic conversation", prompt:"Listen to this short demonstration sentence, then answer the question.", script:"Hello. I have an appointment at ten o'clock.", question:"What time is the appointment?", options:["At nine o'clock","At ten o'clock","At eleven o'clock","At twelve o'clock"], answer:1, explain:"The speaker says the appointment is at ten o'clock."},
      A2: {title:"At the reception desk", prompt:"Listen to the demonstration sentence and identify the information.", script:"Please wait in the waiting room. The nurse will call your name soon.", question:"Where should the visitor wait?", options:["In the pharmacy","In the waiting room","In the car park","In the laboratory"], answer:1, explain:"The speaker asks the visitor to wait in the waiting room."},
      B1: {title:"Preparing for a consultation", prompt:"Listen to the demonstration sentence, then choose the best answer.", script:"Before your appointment, please prepare a list of your current medicines and any allergies you have.", question:"What should the patient prepare?", options:["A list of medicines and allergies","A list of nearby hospitals","A new appointment card only","A list of meals for the week"], answer:0, explain:"The sentence asks for current medicines and allergies."},
      B2: {title:"Clear communication", prompt:"Listen to the demonstration sentence and identify its main purpose.", script:"To make sure we have understood your concerns correctly, could you describe when the symptoms first appeared and whether anything makes them worse?", question:"What is the speaker mainly trying to do?", options:["End the consultation quickly","Clarify the history of the symptoms","Recommend a specific medicine","Explain the clinic's opening hours"], answer:1, explain:"The speaker is gathering details about symptom onset and aggravating factors."}
    },
    reading: {
      A1: {title:"A clinic visit", prompt:"Read the short text and answer the question.", passage:"Mona is at the clinic. Her appointment is at 9:00 a.m. She sits in the waiting room.", question:"Where is Mona?", options:["At a school","At a clinic","At a restaurant","At a library"], answer:1, explain:"The text says Mona is at the clinic."},
      A2: {title:"A reminder message", prompt:"Read the message and answer the question.", passage:"Your appointment is on Tuesday at 11:30 a.m. Please arrive 15 minutes early and bring your appointment card.", question:"When should the visitor arrive?", options:["At 11:15 a.m.","At 11:30 a.m.","At 11:45 a.m.","At 12:00 p.m."], answer:0, explain:"Arriving 15 minutes before 11:30 a.m. means arriving at 11:15 a.m."},
      B1: {title:"A health information notice", prompt:"Read the short notice and answer the question.", passage:"Keeping a written list of medicines can help a healthcare professional review what you take. Include the medicine name, dose, and how often you use it. Tell the professional if anything has recently changed.", question:"Which detail is recommended for the list?", options:["The colour of the package only","The medicine name, dose, and frequency","The shop where it was purchased","The patient's favourite food"], answer:1, explain:"The notice specifically recommends the medicine name, dose, and frequency."},
      B2: {title:"Patient-centred communication", prompt:"Read the passage and choose the best answer.", passage:"Checking a patient's understanding is more than asking whether everything is clear. Inviting the patient to explain the plan in their own words can reveal misunderstandings and give the healthcare professional an opportunity to clarify important information without placing blame.", question:"What is the main benefit of asking a patient to explain the plan in their own words?", options:["It replaces the need for a consultation","It helps identify and clarify misunderstandings","It ensures every patient has the same treatment","It reduces the need to share information"], answer:1, explain:"The passage says this approach can reveal misunderstandings and allow clarification."}
    },
    vocabulary: {
      A1: [{word:"clinic",hint:"Tap to reveal the meaning",definition:"A place where people receive medical advice or treatment."},{word:"nurse",hint:"Tap to reveal the meaning",definition:"A healthcare professional who cares for people who are ill or injured."},{word:"pain",hint:"Tap to reveal the meaning",definition:"An unpleasant physical feeling caused by illness or injury."}],
      A2: [{word:"appointment",hint:"Tap to reveal the meaning",definition:"An arranged time to meet a healthcare professional."},{word:"symptom",hint:"Tap to reveal the meaning",definition:"A change in the body or how a person feels that may indicate illness."},{word:"pharmacy",hint:"Tap to reveal the meaning",definition:"A place where medicines are prepared or supplied."}],
      B1: [{word:"dosage",hint:"Tap to reveal the meaning",definition:"The amount of a medicine to take at one time or over a period."},{word:"allergy",hint:"Tap to reveal the meaning",definition:"An immune response to a substance that is usually harmless to most people."},{word:"diagnosis",hint:"Tap to reveal the meaning",definition:"The identification of a disease or condition based on assessment."}],
      B2: [{word:"contraindication",hint:"Tap to reveal the meaning",definition:"A factor or condition that makes a particular treatment or procedure inadvisable."},{word:"prognosis",hint:"Tap to reveal the meaning",definition:"An informed estimate of the likely course or outcome of a condition."},{word:"adherence",hint:"Tap to reveal the meaning",definition:"The extent to which a person follows an agreed treatment plan."}]
    }
  };

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function scrollToTarget(selector) {
    const target = $(selector);
    if (target) target.scrollIntoView({behavior:"smooth", block:"start"});
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  function chooseSkill(skill) {
    selectedSkill = skill;
    currentQuestion = 0;
    answered = false;
    $$(".skill-card").forEach(card => card.classList.toggle("active", card.querySelector("[data-skill]")?.dataset.skill === skill));
    renderActivity();
    scrollToTarget("#activity");
  }
  function chooseLevel(level) {
    selectedLevel = level;
    currentQuestion = 0;
    answered = false;
    $$(".level-card").forEach(card => {
      const active = card.dataset.level === level;
      card.classList.toggle("selected", active);
      card.setAttribute("aria-pressed", String(active));
    });
    if (selectedSkill) renderActivity();
    else {
      activityTitle.textContent = level + " level selected";
      activitySubtitle.textContent = "Now choose Listening, Reading, or Vocabulary to begin.";
      notify(level + " level selected");
    }
  }
  function renderActivity() {
    if (!selectedSkill) return;
    const skillName = selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1);
    activityTitle.textContent = skillName + " · " + selectedLevel;
    activitySubtitle.textContent = selectedSkill === "vocabulary" ? "Reveal each word's meaning and move through the demonstration cards." : "Try this original demonstration activity. Choose an answer to see feedback.";
    if (selectedSkill === "vocabulary") renderVocab();
    else renderQuestion();
  }
  function renderQuestion() {
    const item = demos[selectedSkill][selectedLevel];
    answered = false;
    const listening = selectedSkill === "listening";
    activityPanel.innerHTML = `
      <div class="exercise">
        <div class="exercise-top"><span class="chip">${selectedLevel}</span><span class="chip">${listening ? "Listening" : "Reading"}</span><span class="chip">Demo activity</span></div>
        <h3>${escapeHtml(item.title)}</h3><p class="exercise-prompt">${escapeHtml(item.prompt)}</p>
        ${listening ? `<div class="audio-box"><button class="audio-play" id="play-audio" aria-label="Play demonstration audio">▶</button><div><strong>Listen to the sentence</strong><small>Browser voice playback · demonstration only</small></div></div>` : `<div class="passage">${escapeHtml(item.passage)}</div>`}
        <h4 class="question-text">${escapeHtml(item.question)}</h4>
        <div class="option-list" role="group" aria-label="Answer options">${item.options.map((option,index)=>`<button class="option-button" data-option="${index}"><span class="option-letter">${String.fromCharCode(65+index)}</span><span>${escapeHtml(option)}</span></button>`).join("")}</div>
        <p class="feedback" id="feedback" aria-live="polite"></p>
        <div class="exercise-footer"><p>Original sample content · Not from a course textbook</p><button class="small-button" id="next-activity" disabled>Try another level →</button></div>
      </div>`;
    $$(".option-button", activityPanel).forEach(button => button.addEventListener("click", () => answerQuestion(Number(button.dataset.option), item)));
    $("#next-activity", activityPanel).addEventListener("click", () => {
      const levels = ["A1","A2","B1","B2"];
      chooseLevel(levels[(levels.indexOf(selectedLevel)+1)%levels.length]);
    });
    const play = $("#play-audio", activityPanel);
    if (play) play.addEventListener("click", () => {
      if (!("speechSynthesis" in window)) { notify("Audio playback is not supported in this browser."); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.script);
      utterance.lang = "en-US";
      utterance.rate = selectedLevel === "A1" ? 0.82 : 0.92;
      play.textContent = "Ⅱ";
      utterance.onend = () => play.textContent = "▶";
      utterance.onerror = () => play.textContent = "▶";
      window.speechSynthesis.speak(utterance);
    });
  }
  function answerQuestion(index, item) {
    if (answered) return;
    answered = true;
    const correct = index === item.answer;
    $$(".option-button", activityPanel).forEach((button, i) => {
      button.disabled = true;
      if (i === item.answer) button.classList.add("correct");
      if (i === index && !correct) button.classList.add("incorrect");
    });
    const feedback = $("#feedback", activityPanel);
    feedback.textContent = (correct ? "Correct! " : "Not quite. ") + item.explain;
    feedback.classList.toggle("bad", !correct);
    $("#next-activity", activityPanel).disabled = false;
    $("#next-activity", activityPanel).textContent = "Next level →";
  }
  function renderVocab() {
    const cards = demos.vocabulary[selectedLevel];
    vocabIndex = Math.min(vocabIndex, cards.length - 1);
    const item = cards[vocabIndex];
    activityPanel.innerHTML = `
      <div class="exercise">
        <div class="exercise-top"><span class="chip">${selectedLevel}</span><span class="chip">Vocabulary</span><span class="chip">Demo flashcards</span></div>
        <h3>Word in focus</h3><p class="exercise-prompt">Read the word, think about what it means, then reveal the definition.</p>
        <button class="flashcard" id="flashcard" aria-label="Reveal word definition"><span class="word">${escapeHtml(item.word)}</span><span class="hint">${escapeHtml(item.hint)}</span><span class="definition">${escapeHtml(item.definition)}</span></button>
        <div class="vocab-controls"><button class="secondary-button" id="prev-word" ${vocabIndex===0?"disabled":""}>← Previous</button><span class="chip">Card ${vocabIndex+1} of ${cards.length}</span><button class="small-button" id="next-word">${vocabIndex===cards.length-1?"Restart cards":"Next word →"}</button></div>
        <p class="content-note">Original demonstration definitions. Final vocabulary must be checked against the approved course books.</p>
      </div>`;
    $("#flashcard", activityPanel).addEventListener("click", () => $("#flashcard", activityPanel).classList.toggle("revealed"));
    $("#prev-word", activityPanel).addEventListener("click", () => {vocabIndex=Math.max(0,vocabIndex-1);renderVocab();});
    $("#next-word", activityPanel).addEventListener("click", () => {vocabIndex=(vocabIndex+1)%cards.length;renderVocab();});
  }

  $$("[data-scroll]").forEach(button => button.addEventListener("click", () => scrollToTarget(button.dataset.scroll)));
  $$("[data-skill]").forEach(button => button.addEventListener("click", () => chooseSkill(button.dataset.skill)));
  $$("[data-level]").forEach(button => button.addEventListener("click", () => chooseLevel(button.dataset.level)));
  const menuToggle = $(".menu-toggle");
  menuToggle.addEventListener("click", () => {
    const open = $(".main-nav").classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menuToggle.textContent = open ? "×" : "☰";
  });
  $$(".main-nav a").forEach(link => link.addEventListener("click", () => {
    $(".main-nav").classList.remove("open");
    menuToggle.setAttribute("aria-expanded","false");
    menuToggle.textContent = "☰";
  }));
  $$(".level-card").forEach(card => card.setAttribute("aria-pressed","false"));
})();