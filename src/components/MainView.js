import { useState, useEffect, useCallback, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import Dictionary from '../data/data.json';
import WordFilter from '../data/word-filter.json';

import classes from './MainView.module.css';
import TypingArea from './TypingArea';

const MainView = () => {
  const dictionary = Dictionary;
  const wordFilter = WordFilter;
  const cardRef = useRef();
  const dictLength = 274937;
  const cardDelayTimer = 1000;
  const [gameState, setGameState] = useState({
    definition: {
      word: '',
      sentence: '',
    },
    level: 1,
    levelStart: false,
    levelScores: {
      words: [],
    },
  });
  const [loaded, setLoaded] = useState(false);
  let levelRef = useRef(gameState.level);

  const getNewDefinition = word => {
    setGameState(prevState => ({
      ...prevState,
      definition: {
        word: word,
        sentence: '',
      },
      level: levelRef.current + 1,
      levelStart: false,
    }));
    setTimeout(() => {
      fetchDefinition(getRandomWord(word));
    }, cardDelayTimer);
  };

  const getRandomWord = useCallback(
    prevWord => {
      let word;
      do {
        word = dictionary[Math.floor(Math.random() * dictLength)];
      } while (word === prevWord || word === undefined);
      console.log(`Getting New Word: ${word} -- Prev Word: ${prevWord}`);
      return word;
    },
    [dictionary]
  );

  const fetchDefinition = useCallback(
    async word => {
      try {
        const result = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        const data = await result.json();
        const fetchedDefinition = data[0].meanings[0].definitions[0].definition
          .trim()
          .normalize('NFD') // Remove accents from chars
          .replace('’', "'") // Replace special apostrophe
          .replace('·', '-') // Replace dot with dash
          .replace(/\.+$/, '') // Remove period from end of sentence
          .replace(/[\u0300-\u036f]/g, ''); // Remove leftover accents from the normalize

        const containsFilteredWord = wordFilter.some(word =>
          fetchedDefinition.includes(word)
        );
        console.log(`Definition is: ${fetchedDefinition}`);

        if (!containsFilteredWord) {
          setGameState(prevState => ({
            ...prevState,
            definition: {
              word,
              sentence: fetchedDefinition,
            },
            levelStart: true,
          }));
          return;
        }
        fetchDefinition(getRandomWord(word));
      } catch (err) {
        fetchDefinition(getRandomWord(word));
      }
    },
    [getRandomWord, wordFilter]
  );

  useEffect(() => {
    levelRef.current = gameState.level;
  });

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
    } else {
      setTimeout(() => {
        fetchDefinition(getRandomWord(''));
      }, cardDelayTimer);
    }
  }, [fetchDefinition, getRandomWord, loaded]);

  return (
    <section className={classes['main-container']}>
      <div className={classes.main}>
        <div className={classes['play-container']}>
          <div className={classes['left-column']}>
            <CSSTransition
              in={gameState.levelStart}
              timeout={500}
              classNames={{
                enterActive: classes['show'],
                enterDone: classes['showing'],
              }}
              nodeRef={cardRef}
            >
              <div ref={cardRef} className={classes.card}>
                <div className={classes.word}>
                  <h1>{gameState.definition.word}</h1>
                </div>
              </div>
            </CSSTransition>
            <div className={classes.level}>Level {gameState.level}</div>
          </div>
          <div className={classes['status-display']}></div>
        </div>
        {gameState.definition.sentence !== '' && (
          <TypingArea gameState={gameState} onComplete={getNewDefinition} />
        )}
      </div>
    </section>
  );
};

export default MainView;
