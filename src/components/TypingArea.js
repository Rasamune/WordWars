import { useEffect, useState, useCallback, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import InvalidKeys from '../data/invalid-keys.json';
import classes from './TypingArea.module.css';

const TypingArea = props => {
  const word = props.gameState.definition.word;
  const definition = props.gameState.definition.sentence;
  const level = props.gameState.level;
  const invalidKeys = InvalidKeys;
  const [typedLetters, setTypedLetters] = useState({
    typedRight: '',
    typedWrong: '',
    remaining: definition,
    amountTyped: 0,
    lastKeyPressed: '',
    length: definition.length,
    wordCount: definition.split(' ').length,
    timerStart: false,
    timesUp: false,
  });

  const timerLength = typedLetters.length / (2 + level * 0.25);
  const timeBarRef = useRef();
  const timerRef = useRef();

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

          if (amountTyped === typedLetters.length) {
            console.log('Words: ', typedLetters.wordCount);
            console.log('--- SENTENCE COMPLETED ---');
            props.onComplete(word);
          }

          if (!typedLetters.timerStart) {
            timerRef.current = setTimeout(() => {
              setTypedLetters(prevState => ({
                ...prevState,
                typedRight: '',
                typedWrong: definition,
                remaining: '',
                timesUp: true,
              }));
            }, timerLength * 1000);
          }

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

          if (amountTyped === typedLetters.length) {
            console.log('Words: ', typedLetters.wordCount);
            console.log('--- SENTENCE COMPLETED ---');
            props.onComplete(word);
          }

          if (!typedLetters.timerStart) {
            timerRef.current = setTimeout(() => {
              setTypedLetters(prevState => ({
                ...prevState,
                typedRight: '',
                typedWrong: definition,
                remaining: '',
                timesUp: true,
              }));
            }, timerLength * 1000);
            console.log(timerRef.current);
          }

          return;
        }

        if (wrongKey === '' && !invalidKeys.includes(e.key)) {
          const typedWrong = typedLetters.remaining.slice(0, 1);
          const remaining = typedLetters.remaining.slice(1);
          setTypedLetters(prevState => ({
            ...prevState,
            typedWrong,
            remaining,
            lastKeyPressed: e.key,
            timerStart: true,
          }));

          if (!typedLetters.timerStart) {
            timerRef.current = setTimeout(() => {
              setTypedLetters(prevState => ({
                ...prevState,
                typedRight: '',
                typedWrong: definition,
                remaining: '',
                timesUp: true,
              }));
            }, timerLength * 1000);
            console.log(timerRef.current);
          }
        }
      }
    },
    [typedLetters, props, word, invalidKeys, timerLength, definition]
  );

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
        lastKeyPressed: '',
        length: definition.length,
        wordCount: definition.split(' ').length,
        timerStart: false,
      });
      timeBarRef.current.style.transition = `all ${timerLength}s linear`;
    }, 100);
    return () => clearTimeout(timerRef.current);
  }, [definition, timerLength]);

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
    </>
  );
};

export default TypingArea;
