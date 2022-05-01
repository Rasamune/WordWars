import { useState, useEffect, useCallback } from 'react';
import classes from './GameSelectArea.module.css';

const difficultyStates = {
  challenger: false,
  normal: false,
  easy: false,
};

const GameSelectArea = props => {
  const [selected, setSelected] = useState({
    ...difficultyStates,
    [props.difficulty]: true,
  });

  const startGameHandler = useCallback(() => {
    const positionIndex = Object.keys(selected).findIndex(
      key => selected[key] === true
    );
    const difficulty = Object.keys(selected)[positionIndex];
    props.onStartGame(difficulty);
  }, [props, selected]);

  const selectHandler = e => {
    const difficulty = e.target.dataset.difficulty;
    const resetSelected = {
      challenger: false,
      normal: false,
      easy: false,
    };
    resetSelected[difficulty] = true;
    setSelected(resetSelected);
  };

  const keydownHandler = useCallback(
    e => {
      const positionIndex = Object.keys(selected).findIndex(
        key => selected[key] === true
      );
      const resetSelected = {
        challenger: false,
        normal: false,
        easy: false,
      };
      if (e.key === 'ArrowDown') {
        let nextPosition = positionIndex + 1;
        if (nextPosition === 3) nextPosition = 0;
        resetSelected[Object.keys(selected)[nextPosition]] = true;
      }
      if (e.key === 'ArrowUp') {
        let nextPosition = positionIndex - 1;
        if (nextPosition === -1) nextPosition = 2;
        resetSelected[Object.keys(selected)[nextPosition]] = true;
      }
      if (e.key === 'Enter') {
        startGameHandler();
        return;
      }
      setSelected(resetSelected);
    },
    [selected, startGameHandler]
  );

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);

    return () => document.removeEventListener('keydown', keydownHandler);
  }, [keydownHandler]);

  return (
    <div className={classes['game-select-container']}>
      <ul>
        <li
          className={selected.challenger ? classes.selected : ''}
          data-difficulty="challenger"
          onMouseEnter={selectHandler}
          onClick={startGameHandler}
        >
          Challenger
        </li>
        <li
          className={selected.normal ? classes.selected : ''}
          data-difficulty="normal"
          onMouseEnter={selectHandler}
          onClick={startGameHandler}
        >
          Normal
        </li>
        <li
          className={selected.easy ? classes.selected : ''}
          data-difficulty="easy"
          onMouseEnter={selectHandler}
          onClick={startGameHandler}
        >
          Easy
        </li>
      </ul>
    </div>
  );
};

export default GameSelectArea;
