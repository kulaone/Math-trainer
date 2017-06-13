/**
 * Created by Daniel gwerzman on 6/6/17.
 */

// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';
let ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
let sprintf = require('sprintf-js').sprintf;

// The context and actions as we declare them in api.ai
const QUIZ_CONTEXT = 'quiz';
const GENERATE_QUESTION_ACTION = 'generate_question';
const CHECK_ANSWER_ACTION = 'check_answer';
const QUIT_ACTION = 'quit';
const DEFAULT_FALLBACK_ACTION = 'input.unknown';

// String format to use as line response
const PLUS_QUESTION = '%s plus %s';
const WRONG_ANSWER = 'No, it\'s not %s. Try again.';
const CORRECT_ANSWER = 'Correct! How much is %s?';
const WELCOME_MESSAGE = 'Welcome to the math trainer!';
const ASK_QUESTION = 'How much is %s';
const QUIT_MESSAGE = 'See you later.';
const FALLBACK_MESSAGE = 'HMMM I didn\'t get that, I asked how much is %s';

const min = 0;
const max = 10;

exports.math_trainer = function (request, response) {
    // print the request to the log
    console.log('headers: ' + JSON.stringify(request.headers));
    console.log('body: ' + JSON.stringify(request.body));

    const assistant = new ApiAiAssistant({request: request, response: response});

    function generateQuestion (assistant) {
        console.log('generateQuestion');
        let newQuestion = getNextQuestion();
        assistant.data.answer = newQuestion.answer;
        assistant.data.question = newQuestion.question;
        assistant.setContext(QUIZ_CONTEXT);
        assistant.ask(printf(WELCOME_MESSAGE + ' ' +
            ASK_QUESTION, newQuestion.question));
    }

    function checkAnswer (assistant) {
        console.log('checkAnswer');
        let answer = assistant.data.answer;
        let userAnswer = assistant.getArgument("number") ? parseInt(assistant.getArgument("number")) : '';

        if (answer != userAnswer) {
            assistant.ask( printf(WRONG_ANSWER, userAnswer));
        } else {
            let newQuestion = getNextQuestion();
            assistant.data.answer = newQuestion.answer;
            assistant.data.question = newQuestion.question;
            assistant.ask(printf(CORRECT_ANSWER, newQuestion.question));
        }
    }

    function defaultFallback (assistant) {
        console.log('defaultFallback: ' + assistant.data.fallbackCount);
        if (assistant.data.fallbackCount === undefined) {
            assistant.data.fallbackCount = 0;
        }
        assistant.data.fallbackCount++;
        assistant.ask(printf(FALLBACK_MESSAGE, assistant.data.question));
    }

    /**
     * Use Tell to send goodbye message and close the mic
     * @param assistant
     */
    function quit (assistant) {
        console.log('quit');
        assistant.tell(QUIT_MESSAGE);
    }

    /**
     * Use sprintf to reformat the string and add params to it
     * @param line
     * @returns {*}
     */
    function printf(line) {
        console.log('printf: ' + line);
        return sprintf.apply(this, arguments);
    }

    // Map all the actions that create on api.ai to the function in this file
    let actionsMap = new Map();
    actionsMap.set(GENERATE_QUESTION_ACTION, generateQuestion);
    actionsMap.set(CHECK_ANSWER_ACTION, checkAnswer);
    actionsMap.set(DEFAULT_FALLBACK_ACTION, defaultFallback);
    actionsMap.set(QUIT_ACTION, quit);
    assistant.handleRequest(actionsMap);
};

/**
 * Randomize the next question
 * @returns {{answer: number, question: string}}
 */
function getNextQuestion (){
    let value1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let value2 = Math.floor(Math.random() * (max - min + 1)) + min;
    let res = {
        answer: (value1 + value2),
        question: sprintf(PLUS_QUESTION, value1, value2)
    };
    console.log(JSON.stringify(res));
    return res;
}