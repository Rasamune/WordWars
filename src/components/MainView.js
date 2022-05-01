import { useState, useEffect, useCallback, useRef } from 'react';
import GameSelectArea from './GameSelectArea';
import HighScoresArea from './HighScoresArea';
import WordArea from './WordArea';
import StatusArea from './StatusArea';
import TypingArea from './TypingArea';
import Dictionary from '../data/data.json';
import WordFilter from '../data/word-filter.json';

import classes from './MainView.module.css';

const getHighscoresLocalStorage = () => {
  const highscores = JSON.parse(window.localStorage.getItem('highscores'));
  if (highscores) return highscores;
  return {
    challenger: [],
    normal: [],
    easy: [],
  };
};

const saveHighscoresLocalStorage = highscores => {
  return window.localStorage.setItem('highscores', JSON.stringify(highscores));
};

const MainView = () => {
  const dictionary = Dictionary;
  const wordFilter = WordFilter;
  const dictLength = 274046;
  const cardDelayTimer = 1000;
  const [gameState, setGameState] = useState({
    highscores: getHighscoresLocalStorage(),
    definition: {
      word: '',
      sentence: '',
    },
    level: 1,
    levelStart: false,
    wordScores: {
      words: [],
      totalScore: 0,
      totalWPM: 0,
    },
    combo: -1,
    difficulty: 'normal',
    gameOver: false,
    newGame: true,
  });
  // const [loaded, setLoaded] = useState(false);
  let levelRef = useRef(gameState.level);
  const score = gameState.wordScores.words.reduce((a, b) => a + b.score, 0);
  let wpm = 0;
  if (gameState.wordScores.words.length > 0)
    wpm = Math.trunc(
      gameState.wordScores.words.reduce((a, b) => a + b.wpm, 0) /
        gameState.wordScores.words.length
    );

  const startGameHandler = difficulty => {
    setGameState(prevState => ({
      ...prevState,
      difficulty: difficulty,
      newGame: false,
    }));
    setTimeout(() => {
      fetchDefinition(getRandomWord(''));
    }, cardDelayTimer);
  };

  const getNewDefinitionHandler = prevLevelObject => {
    setGameState(prevState => ({
      ...prevState,
      definition: {
        word: prevLevelObject.word,
        sentence: '',
      },
      level: levelRef.current + 1,
      levelStart: false,
      wordScores: {
        words: [
          ...prevState.wordScores.words,
          {
            word: prevLevelObject.word,
            wpm: prevLevelObject.wpm,
            score: prevLevelObject.score,
            mistakes: prevLevelObject.mistakes,
            combo: prevLevelObject.combo,
          },
        ],
      },
      combo: prevLevelObject.combo,
    }));
    setTimeout(() => {
      fetchDefinition(getRandomWord(prevLevelObject.word));
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

        const tooManyCharacters = fetchedDefinition.length > 200;
        const containsFilteredWord = wordFilter.some(word =>
          fetchedDefinition.includes(word)
        );
        console.log(`Definition is: ${fetchedDefinition}`);

        if (!containsFilteredWord && !tooManyCharacters) {
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

  const gameOverHandler = () => {
    setGameState(prevState => ({
      ...prevState,
      levelStart: false,
      gameOver: true,
    }));
  };

  const keydownHandler = useCallback(
    e => {
      if (e.key === 'Enter') {
        const prevHighscores = gameState.highscores;
        const currentDifficultyScores = prevHighscores[gameState.difficulty];
        let newHighscores;
        if (score > 0) {
          currentDifficultyScores.push({
            level: gameState.level,
            score: score,
            wpm: wpm,
          });
          currentDifficultyScores.sort((a, b) => b.score - a.score);
          newHighscores = {
            ...prevHighscores,
            [gameState.difficulty]: currentDifficultyScores,
          };
        }
        if (score === 0) newHighscores = prevHighscores;
        // Save LocalStorage
        saveHighscoresLocalStorage(newHighscores);
        // Reset GameState back to defaults
        setGameState({
          highscores: newHighscores,
          definition: {
            word: '',
            sentence: '',
          },
          level: 1,
          levelStart: false,
          wordScores: {
            words: [],
            totalScore: 0,
            totalWPM: 0,
          },
          combo: -1,
          difficulty: 'normal',
          gameOver: false,
          newGame: true,
        });
      }
    },
    [gameState, score, wpm]
  );

  useEffect(() => {
    if (gameState.gameOver) {
      document.addEventListener('keydown', keydownHandler);

      return () => document.removeEventListener('keydown', keydownHandler);
    }
  }, [keydownHandler, gameState.gameOver]);

  useEffect(() => {
    levelRef.current = gameState.level;
  });

  return (
    <section className={classes['main-container']}>
      <div className={classes.main}>
        <div className={classes['play-container']}>
          {gameState.newGame && (
            <GameSelectArea onStartGame={startGameHandler} />
          )}
          {!gameState.newGame && (
            <>
              <WordArea gameState={gameState} />
              <StatusArea gameState={gameState} score={score} wpm={wpm} />
            </>
          )}
        </div>
        {gameState.definition.sentence !== '' &&
          !gameState.gameOver &&
          !gameState.newGame && (
            <TypingArea
              gameState={gameState}
              onComplete={getNewDefinitionHandler}
              onFail={gameOverHandler}
            />
          )}
        {gameState.gameOver && (
          <div className={classes['gameover-container']}>
            <div className={classes.gameover}>Game Over</div>
            <div className={classes.results}>
              You scored <span className={classes.score}>{score}pts</span> at{' '}
              <span>{wpm}</span>/wpm
            </div>
            <div className={classes.continue}>
              Press <span>Enter</span> to continue...
            </div>
          </div>
        )}
        {gameState.newGame && !gameState.gameOver && (
          <HighScoresArea highscores={gameState.highscores} />
        )}
      </div>
    </section>
  );
};

export default MainView;
