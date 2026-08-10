import {DayChip} from '../atoms/DayChip';
import {DAYS_OF_WEEK} from '../../constants/days';

const styles = {wrapper: 'flex flex-wrap gap-2'};

export const DaysSelector = ({selectedDays, onToggle}) => {
  return (
    <div className={styles.wrapper}>
      {DAYS_OF_WEEK.map((day) => (
        <DayChip key={day.value} label={day.label} active={selectedDays.includes(day.value)} onClick={() => onToggle(day.value)} />
      ))}
    </div>
  );
};