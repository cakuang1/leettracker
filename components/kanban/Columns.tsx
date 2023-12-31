import React, { ChangeEvent } from 'react';
import Card from './Card';
import { useState ,useEffect,useRef} from 'react';
import { parseISO, format, getDay } from 'date-fns';
import { LeetCodeQuestionDTO,UserQuestionDTO } from '../types';
import SearchResult from './SearchResult';
import { useKanban } from '../context/Kanbancontext';
import Modal from './Modal';
import { notify,GA,BA } from '../notifications';





interface SearchProps {
    onClickOutside: () => void;
    date : string
  }

interface ColumnProps {
    id: string;
    cards: UserQuestionDTO[];
  }



function Searching({ onClickOutside,date}: SearchProps) {


  const {update} = useKanban();

    const searchRef = useRef<HTMLDivElement | null>(null);
    const [query, setQuery] = useState('');
    const [queryResults, setQueryResults] = useState<LeetCodeQuestionDTO[]>([]);
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
          onClickOutside();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [onClickOutside]);

    const handleSearchResultClick = async (card: LeetCodeQuestionDTO,date:string) => {


      setQuery('');
      setQueryResults([]);
      try {
        await postLeetCodeQuestion(card, date);
        update();

      } catch (error) {
      }
    };  


    const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
      const newQuery = event.target.value;
      setQuery(newQuery);
      // Call the API to search based on the new query
      searchApi(newQuery).then((results) => {
        setQueryResults(results);
      });
    };
    return (
        <div ref={searchRef}>

      <div  className=" border rounded p-2 text-sm hover:border-leetcode  hover:shadow cursor-pointer flex items-center p-2 cursor-pointer bg-white">
        <div className="add-card-left text-gray-400 pr-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="16" stroke-dashoffset="16" d="M10.5 13.5L3 21"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.2s" values="16;0"/></path><path stroke-dasharray="40" stroke-dashoffset="40" d="M10.7574 13.2426C8.41421 10.8995 8.41421 7.10051 10.7574 4.75736C13.1005 2.41421 16.8995 2.41421 19.2426 4.75736C21.5858 7.10051 21.5858 10.8995 19.2426 13.2426C16.8995 15.5858 13.1005 15.5858 10.7574 13.2426Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="40;0"/></path></g></svg>
        </div>
        <input autoComplete="off" type="email" name="email" id="email" placeholder="Search for problem to add " className="focus:outline-none form-input bg-white add-card-right text-gray-400 w-full"  onChange={handleQueryChange}/>
      </div>
      <ul>
        {queryResults.map((question) => (
          <SearchResult
          key={question.qid}
          card={question}
          onClick={() => handleSearchResultClick(question,date)}
        />
        ))}
      </ul>
      </div>
    );  
  }

  const userQuestion: UserQuestionDTO = {
    id: 1,
    githubId: "user123",
    questionId: 12345,
    title: "Sample Question",
    difficulty: "Medium",
    titleSlug: "sample-question",
    topicTags: ["tag1", "tag2"],
    categorySlug: "sample-category",
    completionStatus: true,
    timeTaken: "30-45", // Time string
    code: "console.log('Hello, World!');",
    notes: "This is a sample question.",
    date: "2023-10-31",
  };




function Column({ id, cards }: ColumnProps) {
  const {update} = useKanban();
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<UserQuestionDTO>(userQuestion);
    const openModal = (card:UserQuestionDTO) => {
      setSelectedCard(card);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setSelectedCard(userQuestion);
      setIsModalOpen(false);
    };

     const handleEditClick = () => {
        setIsEditing(true);
      };
      const handleEditOff = () => {
        setIsEditing(false);
      };
      
      const sortedCards = cards.slice().sort((a, b) => {
        // Sort by completionStatus first
        if (!a.completionStatus && b.completionStatus) {
          return -1;
        }
        if (a.completionStatus && !b.completionStatus) {
          return 1;
        }
      
        // If completionStatus is the same, sort by difficulty
        // Assuming 'difficulty' is a property that represents the difficulty of the card (e.g., 'easy', 'medium', 'hard')
        const difficultyOrder:Record<string, number> = { easy: 0, medium: 1, hard: 2 }; // Define the order of difficulty levels
      
        const difficultyComparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        if (difficultyComparison !== 0) {
          return difficultyComparison;
        }
      
        // If both completionStatus and difficulty are the same, sort by questionId
        return a.questionId - b.questionId;
      });

    const isCurrent = isCurrentDate(id)
    const bgClass = isCurrent ? "bg-orange-50" : "";
    return (
        <div className={`kanban-column w-1/6 px-2 mx-2 pt-4 flex-shrink-0 rounded ${bgClass}` }>
            <span className="font-bold text-xl">{getDateInfoFromISODate(id).month} </span>
                <span className="font-bold text-xl">{getDateInfoFromISODate(id).day} </span>
                <span className="font-bold text-leetcode">{getDateInfoFromISODate(id).dayOfWeek}</span>
            {isEditing ? <Searching onClickOutside={handleEditOff} date = {id}/> : <div className=" border rounded-xl  hover:border-leetcode  hover:shadow cursor-pointer flex items-center  p-2 text-sm bg-white cursor-pointer " onClick={handleEditClick}>
            <div className="add-card-left text-gray-400  pr-2 ">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"><rect width="36" height="36" x="6" y="6" rx="3"/><path stroke-linecap="round" d="M24 16v16m-8-8h16"/></g></svg> 
            </div>
            <div className="add-card-right text-gray-400" >
                Add a Problem
            </div>
            </div>}
            <div className='cardsection'>

                {sortedCards.map((card, index) => (

                  <Card key={card.id} card={card} modalfunction={openModal} />

                ))}
              </div>
              <Modal isOpen = {isModalOpen} closeModal = {closeModal} cardData = {selectedCard} updatefunction = {update} calendar = {true}/>

        </div>
    );
  }
export default Column;

function getDateInfoFromISODate(dateString:string) {

  const dateObject = parseISO(dateString); // Parse the ISO date string
  const dayOfWeek = format(dateObject, 'EEEE'); // Get the day of the week
  const month = format(dateObject, 'MMM'); // Get the month
  const day = dateObject.getDate(); // Get the day

  return { month, dayOfWeek, day };
}

function isCurrentDate(isoDate: string) {
  const date = getCurrentDateISOString();

  return date === isoDate;
}



const searchApi = async (query: string): Promise<LeetCodeQuestionDTO[]> => {
  return fetch(`/api/search?query=${query}`)
    .then((response) => response.json())
};

async function postLeetCodeQuestion(card:LeetCodeQuestionDTO,date:string) {
  const endpoint = `/api/userquestions/add?date=${date}` 
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(card),
    })  .then((response) => {
      if (response.status === 200) {
        return response.json().then((data) => {
          const errorMessage = data.message;

          notify(GA,errorMessage,)
          console.error('Error:', errorMessage);
        });
      } else if (response.status === 400 || response.status === 401) {
        return response.json().then((data) => {
          const errorMessage = data.message;
          const difficulty = data.difficulty;
          notify(BA,errorMessage,)
          console.error('Error:', errorMessage);
        });
      } else if (response.status === 500) {
        return response.json().then((data) => {
          const error = data.error;
          console.error('Server Error:', error);
        });
      } else {
        throw new Error('Unknown error');
      }
    })}



function getColorClasses(difficulty : String) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return ''; 
  }
}

function getCurrentDateISOString() {
  const currentDate = new Date();
  
  // Format the current date as an ISO string with only the date part
  const isoString = format(currentDate, 'yyyy-MM-dd');

  return isoString;
}
