"use client";
import {
  Card,
  Grid,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Title,
  Metric 
} from "@tremor/react";
import Layout from "@/components/layout";
import ChartView from "@/components/dashboard/Graph";
import { useEffect,useState } from "react";
import { UserQuestionDTO } from "@/components/types";
import Bar from "@/components/dashboard/Bar";
import Neetcode from "@/components/dashboard/plans/Neetcode";

export type DailyPerformance = {
  date: string;
  questionsDone: number;
};

export default function Dashboard() {
  const [questions, setQuestions] = useState<any>(null);
  const [categories,setCategories] = useState<Record<string,number>>({});
  const [questionsByDayWeek, setQuestionsByDayWeek] = useState({});
  const [questionsByDayMonth, setQuestionsByDayMonth] = useState({});
  const [questionsByDaySixMonths, setQuestionsByDaySixMonths] = useState({});
  const [questionsByDayYear, setQuestionsByDayYear] = useState({});
  const [topic, setTopic] = useState<TopicCount[] | null>(null);

  useEffect(() => {
    const apiUrl = "/api/userquestions/graball";
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Once data is fetched, update the state with the questions
        setQuestions(data);
        setCategories(calculateDifficultyCounts(data.completed))
        const questionsByDayWeek = calculateQuestionsByDay(data.completed, oneWeekAgo, currentDate);
        const questionsByDayMonth = calculateQuestionsByDay(data.completed, oneMonthAgo, currentDate);
        const questionsByDaySixMonths = calculateQuestionsByDay(data.completed, sixMonthsAgo, currentDate);
        const questionsByDayYear = calculateQuestionsByDay(data.completed, oneYearAgo, currentDate);
        setQuestionsByDayWeek(questionsByDayWeek);
        setQuestionsByDayMonth(questionsByDayMonth);
        setQuestionsByDaySixMonths(questionsByDaySixMonths);
        setQuestionsByDayYear(questionsByDayYear);
        setTopic(generateTopicCounts(data.completed))
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });

  }, []);

  console.log("Questions By Day (Past Week):", questionsByDayWeek);


  return (
    <Layout>
      <div className="w-3/5 mx-auto text-center mt-10 ">
      <Title className="font-bold text-2xl">Dashboard</Title>
<TabGroup className="mt-6"> 
  <TabPanels>
    <TabPanel>
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
        <Card className=" ">
        <div className="text-center pt-6 ">
          <div></div>
          <Metric>{questions != null ? calculateTotalItems(questions.completed) : '--'}</Metric>
          <Text className="mt-5">Total Questions Solved</Text>
        </div>
        </Card>
        <Card className=" ">
        <div className="text-center pt-6 ">
          <Metric>{categories.easy}</Metric>
          <div className="inline-flex items-center mt-5">
  <span className="w-2 h-2 inline-block bg-green-500 rounded-full   mr-2"></span>

  <Text className="text-gray-600 text-sm">Easy</Text>
</div>
        </div>
        </Card>
        <Card className=" ">
        <div className="text-center pt-6 ">
          <Metric>{categories.medium}</Metric>
          <div className="inline-flex items-center mt-5">
  <span className="w-2 h-2 inline-block bg-yellow-200 rounded-full   mr-2"></span>
  <Text className="text-gray-600 text-sm">Medium</Text>
</div>
        </div>
        </Card>
        <Card className=" ">
        <div className="text-center pt-6 ">
          <Metric>{categories.hard}</Metric>
          <div className="inline-flex items-center mt-5">
  <span className="w-2 h-2 inline-block bg-red-500 rounded-full   mr-2"></span>

  <Text className="text-gray-600 text-sm">Hard</Text>
</div>
        </div>
        </Card>
      </Grid>
      <div className="mt-6">
      <Card>
          <ChartView listofcategories = {[questionsByDayWeek,questionsByDayMonth,questionsByDaySixMonths,questionsByDayYear]}/>
        </Card>
      </div>
      <div className="mt-6">
          <Bar bardata = {topic} />
      </div>
    </TabPanel>
  </TabPanels>
</TabGroup>
      </div>
      </Layout>
  )
}


function calculateTotalItems(data:UserQuestionDTO[]) {
  return data.length;
}
function calculateDifficultyCounts(data:UserQuestionDTO[]) {
  const counts: { [key: string]: number } = {
    easy: 0,
    medium: 0,
    hard: 0
  };

  data.forEach(item => {
    const difficulty = item.difficulty.toLowerCase();
    if (counts.hasOwnProperty(difficulty)) {
      counts[difficulty]++;
    }
  });

  return counts;
}
// Function to calculate the counts for easy, medium, and hard questions
function calculateQuestionsByDay(data: UserQuestionDTO[], startDate: Date, endDate: Date) {
  const counts: DailyPerformance[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const formattedDate = currentDate.toISOString().split("T")[0];

    const questionsDone = data.filter((item) => {
      const itemDate = item.date.split("T")[0];
      return itemDate === formattedDate;
    }).length;

    counts.push({
      date: formattedDate,
      questionsDone,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  return counts;
}




// Get the current date and calculate the start dates for the past week, month, 6 months, and year
const currentDate = new Date();
const oneWeekAgo = new Date(currentDate);
oneWeekAgo.setDate(currentDate.getDate() - 7);
const oneMonthAgo = new Date(currentDate);
oneMonthAgo.setMonth(currentDate.getMonth() - 1);
const sixMonthsAgo = new Date(currentDate);
sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
const oneYearAgo = new Date(currentDate);
oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

// Calculate the number of questions done by day for the past week, month, 6 months, and year


interface TopicCount {
  topic: string;
  count: number;
}


function generateTopicCounts(data: UserQuestionDTO[]): TopicCount[] {
  const topicBuckets: { [key: string]: TopicCount } = {};

  data.forEach(item => {
    if (item.topicTags) {
      item.topicTags.forEach(tag => {
        if (!topicBuckets[tag]) {
          topicBuckets[tag] = {
            topic: tag,
            count: 1,
          };
        } else {
          topicBuckets[tag].count++;
        }
      });
    }
  });

  return Object.values(topicBuckets);
}




