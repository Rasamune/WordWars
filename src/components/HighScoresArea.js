import classes from './HighScoresArea.module.css';

const HighScoresArea = props => {
  const highscores = props.highscores;

  return (
    <div className={classes['highscores-container']}>
      <div className={classes.challenger}>
        <h1>Challenger Highscores</h1>
        <ul>
          {highscores.challenger.length > 0 &&
            highscores.challenger.map((score, _i) => (
              <li key={`score${_i}`}>
                <div className={classes.level}>Lv{score.level}</div>
                <div className={classes.wpm}>
                  <span>{score.wpm}</span>/wpm
                </div>
                <div className={classes.score}>
                  <span>{score.score}pts</span>
                </div>
              </li>
            ))}
        </ul>
      </div>
      <div className={classes.normal}>
        <h1>Normal Highscores</h1>
        <ul>
          {highscores.normal.length > 0 &&
            highscores.normal.map((score, _i) => (
              <li key={`score${_i}`}>
                <div className={classes.level}>Lv{score.level}</div>
                <div className={classes.wpm}>
                  <span>{score.wpm}</span>/wpm
                </div>
                <div className={classes.score}>
                  <span>{score.score}pts</span>
                </div>
              </li>
            ))}
        </ul>
      </div>
      <div className={classes.easy}>
        <h1>Easy Highscores</h1>
        <ul>
          {highscores.easy.length > 0 &&
            highscores.easy.map((score, _i) => (
              <li key={`score${_i}`}>
                <div className={classes.level}>Lv{score.level}</div>
                <div className={classes.wpm}>
                  <span>{score.wpm}</span>/wpm
                </div>
                <div className={classes.score}>
                  <span>{score.score}pts</span>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default HighScoresArea;
