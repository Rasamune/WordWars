import classes from './Header.module.css';

const Header = () => {
  return (
    <header>
      <div className={classes.wrap}>
        <h1>Word Wars</h1>
      </div>
    </header>
  );
};

export default Header;
