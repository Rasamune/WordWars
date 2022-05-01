import { useEffect, useState, useCallback, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { ReactComponent as Heart } from '../svg/red-heart.svg';
import InvalidKeys from '../data/invalid-keys.json';
import classes from './TypingArea.module.css';

const TypingArea = props => {
  const word = props.gameState.definition.word;
  const definition = props.gameState.definition.sentence;
  const level = props.gameState.level;
  const combo = props.gameState.combo;
  const invalidKeys = InvalidKeys;
  const difficulty = props.gameState.difficulty;
  const hearts = props.gameState.hearts;
  const timeBarRef = useRef();
  const timerRef = useRef();
  const timerStartTimer = useRef();
  const [typedLetters, setTypedLetters] = useState({
    typedRight: '',
    typedWrong: '',
    remaining: definition,
    amountTyped: 0,
    amountWrong: 0,
    combo,
    lastKeyPressed: '',
    length: definition.length,
    timerStart: false,
    timesUp: false,
    hearts,
  });

  let timerLength = typedLetters.length / (2 + level * 0.1);
  if (difficulty === 'challenger')
    timerLength = typedLetters.length / (2 + level * 0.25);
  if (difficulty === 'easy')
    timerLength = typedLetters.length / (1.5 + level * 0.05);

  const definitionDisplay = () => (
    <>
      <li className={`${classes.letter} ${classes.right}`}>
        {typedLetters.typedRight}
      </li>
      {typedLetters.typedWrong !== '' && (
        <li
          className={`${classes.letter} ${classes.wrong} ${
            typedLetters.typedWrong === ' ' ? classes.space : ''
          }`}
        >
          {typedLetters.typedWrong}
        </li>
      )}
      <li className={`${classes.letter}`}>{typedLetters.remaining}</li>
    </>
  );

  const calculateScores = useCallback(() => {
    const words = typedLetters.length / 5.5;
    const time =
      (new Date().getTime() - new Date(timerStartTimer.current).getTime()) /
      1000;
    const wpm = Math.trunc((60 / time) * words);

    let mistakes = typedLetters.amountWrong * 10;
    if (mistakes > 90) mistakes = 90;

    let currentCombo = typedLetters.combo + 1;
    if (mistakes > 0) currentCombo = -1;

    let score = 100 - mistakes;
    if (currentCombo !== -1) score += currentCombo * 25;

    return {
      wpm: wpm,
      score,
      mistakes: typedLetters.amountWrong,
      combo: currentCombo,
    };
  }, [typedLetters]);

  const definitionCompleted = useCallback(() => {
    const scores = calculateScores();
    const remainingHearts = typedLetters.hearts;
    console.log(remainingHearts);
    console.log('--- SENTENCE COMPLETED ---');
    props.onComplete({ word, remainingHearts, ...scores });
  }, [calculateScores, props, word, typedLetters]);

  const definitionFailed = useCallback(() => {
    clearTimeout(timerRef.current);
    console.log('failed');
    setTimeout(() => {
      props.onFail();
    }, 1000);
  }, [props]);

  const startWordTimer = useCallback(() => {
    timerStartTimer.current = new Date();
    timerRef.current = setTimeout(() => {
      setTypedLetters(prevState => ({
        ...prevState,
        typedRight: '',
        typedWrong: definition,
        remaining: '',
        timesUp: true,
      }));
      definitionFailed();
    }, timerLength * 1000);
  }, [definitionFailed, definition, timerLength]);

  const keydownHandler = useCallback(
    e => {
      if (e.key !== typedLetters.lastKeyPressed && !typedLetters.timesUp) {
        let compareLetter = typedLetters.remaining.slice(0, 1);
        const wrongKey = typedLetters.typedWrong;
        const amountTyped = typedLetters.amountTyped + 1;

        if (e.key === compareLetter && wrongKey === '') {
          const typedRight = typedLetters.remaining.slice(0, 1);
          const remaining = typedLetters.remaining.slice(1);
          setTypedLetters(prevState => ({
            ...prevState,
            typedRight: typedLetters.typedRight + typedRight,
            typedWrong: '',
            remaining,
            amountTyped: amountTyped,
            lastKeyPressed: '',
            timerStart: true,
          }));

          if (amountTyped === typedLetters.length) definitionCompleted();

          if (!typedLetters.timerStart) startWordTimer();

          return;
        }

        if (e.key === wrongKey) {
          const typedRight = wrongKey;
          const remaining = typedLetters.remaining;

          setTypedLetters(prevState => ({
            ...prevState,
            typedRight: typedLetters.typedRight + typedRight,
            typedWrong: '',
            remaining,
            amountTyped: amountTyped,
            lastKeyPressed: '',
            timerStart: true,
          }));

          if (amountTyped === typedLetters.length) definitionCompleted();

          if (!typedLetters.timerStart) startWordTimer();

          return;
        }

        if (wrongKey === '' && !invalidKeys.includes(e.key)) {
          if (typedLetters.hearts !== 1) {
            const typedWrong = typedLetters.remaining.slice(0, 1);
            const remaining = typedLetters.remaining.slice(1);
            setTypedLetters(prevState => ({
              ...prevState,
              typedWrong,
              remaining,
              lastKeyPressed: e.key,
              timerStart: true,
              amountWrong: typedLetters.amountWrong + 1,
              hearts: typedLetters.hearts - 1,
            }));

            if (!typedLetters.timerStart) startWordTimer();
          }
          if (typedLetters.hearts === 1) {
            setTypedLetters(prevState => ({
              ...prevState,
              typedRight: '',
              typedWrong: definition,
              remaining: '',
              timesUp: true,
              hearts: 0,
            }));
            definitionFailed();
          }
        }
      }
    },
    [
      startWordTimer,
      definitionCompleted,
      definitionFailed,
      typedLetters,
      invalidKeys,
      definition,
    ]
  );

  const getHearts = () => {
    const heartContainer = [];
    const remaining = 15 - typedLetters.hearts;
    for (let i = 0; i < typedLetters.hearts; i++) {
      heartContainer.push(
        <li key={`heart${i}`}>
          <Heart />
        </li>
      );
    }
    for (let i = 0; i < remaining; i++) {
      heartContainer.push(
        <li key={`empty${i}`} className={classes.empty}>
          <Heart />
        </li>
      );
    }
    return heartContainer;
  };

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);

    return () => document.removeEventListener('keydown', keydownHandler);
  }, [keydownHandler]);

  useEffect(() => {
    timeBarRef.current.style.transition = `all 0s linear`;
    setTimeout(() => {
      setTypedLetters({
        typedRight: '',
        typedWrong: '',
        remaining: definition,
        amountTyped: 0,
        amountWrong: 0,
        combo,
        lastKeyPressed: '',
        length: definition.length,
        wordCount: definition.split(' ').length,
        timerStart: false,
        timesUp: false,
        hearts,
      });
      timeBarRef.current.style.transition = `all ${timerLength}s linear`;
    }, 100);
    return () => clearTimeout(timerRef.current);
  }, [definition, timerLength, combo, hearts]);

  return (
    <>
      <div className={classes['type-container']}>
        <div className={classes['typing-area']}>
          <ul className={classes.definition}>{definitionDisplay()}</ul>
        </div>
      </div>
      <div className={classes['type-timer']}>
        <CSSTransition
          in={typedLetters.timerStart}
          timeout={timerLength * 1000}
          classNames={{
            enterActive: classes['enter-active'],
            enterDone: classes['enter-done'],
          }}
          nodeRef={timeBarRef}
        >
          <div className={classes['time-bar']} ref={timeBarRef}></div>
        </CSSTransition>
      </div>
      {difficulty === 'challenger' && (
        <div className={classes['type-hearts']}>
          <ul>{getHearts()}</ul>
        </div>
      )}
    </>
  );
};

export default TypingArea;
