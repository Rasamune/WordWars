import classes from './StatusArea.module.css';

const StatusArea = props => {
  const wordScores = { ...props.gameState.wordScores };
  const score = props.score;
  const wpm = props.wpm;

  return (
    <div className={classes['status-container']}>
      {wordScores.words.length > 0 && (
        <>
          <div className={classes.totals}>
            <div className={classes.wpm}>
              <span>{wpm}</span> /wpm
            </div>
            <div className={classes.totalScore}>
              Score <span>{score}pts</span>
            </div>
          </div>
          <ul>
            {wordScores.words.map((word, _i) => {
              return (
                <li key={`score${_i}`}>
                  <div className={classes.word}>{word.word}</div>
                  {word.mistakes > 0 && (
                    <div className={classes.mistakes}>
                      <span>
                        {word.mistakes} Mistake{word.mistakes > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {word.combo > 0 && (
                    <div className={classes.combo}>
                      Combo <span>(+{word.combo * 25})</span>
                    </div>
                  )}
                  {word.combo <= 0 && word.mistakes === 0 && <div></div>}
                  <div className={classes.score}>
                    <span>{word.score}pts</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default StatusArea;
