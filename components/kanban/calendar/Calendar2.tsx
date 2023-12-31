import React from 'react';
import { eachWeekOfInterval, startOfMonth, endOfMonth,addMonths,format,eachDayOfInterval} from 'date-fns';
import { useState  } from 'react';
import WeekRow2 from './Weekrow2';

// this will be used to change the dates in a modal, how the value of the calender also changes the value of the parent component

function Calendar({value,handleDateClick}:any) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [currvalue,setValue] = useState<string>(value);


  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, -1));
  };
  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };
  const weeksInMonth = eachWeekOfInterval({
    start: currentMonth,
    end: addMonths(currentMonth, 1),
  });

  function handleDateSelection(date:string) {
   
    //sets the new value for the modal
    handleDateClick(date); 
    //sets the new value for the current
    setValue(date);

  }

  return (
    <div className='absolute mt-3 bg-white border p-4 rounded' >
      <div className='header flex justify-between mb-1'>
        <h2 className='font-semibold'>{format(currentMonth, 'MMMM yyyy')}</h2>
        <div > <button onClick={handlePrevMonth} className='hover:text-gray-400'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="M8.293 12.707a1 1 0 0 1 0-1.414l5.657-5.657a1 1 0 1 1 1.414 1.414L10.414 12l4.95 4.95a1 1 0 0 1-1.414 1.414l-5.657-5.657Z"/></g></svg></button>
        <button onClick={handleNextMonth} className='hover:text-gray-400'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="M15.707 11.293a1 1 0 0 1 0 1.414l-5.657 5.657a1 1 0 1 1-1.414-1.414l4.95-4.95l-4.95-4.95a1 1 0 0 1 1.414-1.414l5.657 5.657Z"/></g></svg></button>
      
</div>
      </div>
      <div className='border  px-2 mb-3'></div>
    <div className="calendar  flex flex-col ">
      <div className="flex   text-sm text-gray-300 mb-3">
      <div className="weekday w-10 text-center justify-center">S</div>
        <div className="weekday w-10 text-center justify-center">M</div>
        <div className="weekday w-10 text-center justify-center">T</div>
        <div className="weekday w-10 text-center justify-center">W</div>
        <div className="weekday w-10 text-center justify-center">T</div>
        <div className="weekday w-10 text-center justify-center">F</div>
        <div className="weekday w-10 text-center justify-center">S</div>
      </div>
      {weeksInMonth.map((weekStartDate) => (
        <WeekRow2 key={weekStartDate.getTime()} startDate={weekStartDate} month={currentMonth} onDayClick = {handleDateSelection}/>
        ))}
    </div>
    </div>
  );
}

export default Calendar;
