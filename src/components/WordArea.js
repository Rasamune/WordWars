import { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import classes from './WordArea.module.css';

const WordArea = props => {
  const gameState = props.gameState;
  const cardRef = useRef();

  return (
    <div className={classes['card-container']}>
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
  );
};

export default WordArea;
