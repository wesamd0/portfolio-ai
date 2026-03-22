"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from "react";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Book,
  Users,
  ShieldAlert,
  TrendingUp,
  Send,
  Lightbulb,
  Zap,
  Target,
  Puzzle,
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";

const chatTransport = new DefaultChatTransport({
  api: "/api/seg-4300",
});

const initialMessages: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hello! I'm your assistant for the AI-Powered Academic Assistants project. How can I help you today?",
      },
    ],
  },
];

export default function SEG4300Project() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [input, setInput] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const isAutoScrollEnabled = true;

  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
    messages: initialMessages,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
    },
  });
  const isLoading = status === "submitted" || status === "streaming";

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const modalChatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    if (isAutoScrollEnabled) {
      scrollTimeout.current = setTimeout(() => {
        const activeContainer = isFullscreen
          ? modalChatContainerRef.current
          : chatContainerRef.current;

        if (activeContainer) {
          activeContainer.scrollTo({
            top: activeContainer.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [isAutoScrollEnabled, isFullscreen]);

  useEffect(() => {
    scrollToBottom();
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [scrollToBottom]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Force load metadata to get duration
      audio.load();
      
      const handleLoadedMetadata = () => {
        console.log('Audio duration:', audio.duration); // Debug log
        setDuration(audio.duration);
        setCurrentTime(0);
      };

      // Try to get duration immediately if already loaded
      if (audio.readyState >= 1) {
        handleLoadedMetadata();
      }

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      const handleError = (e: ErrorEvent) => {
        console.error('Error loading audio:', e);
        setIsPlaying(false);
      };

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("error", handleError);
      };
    }
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipAudio = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleFormSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    await sendMessage({ text: trimmedInput });
    setInput("");
  };

  const handleMobileChat = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
      setIsFullscreen(false);
    } else {
      setIsChatOpen(true);
      setIsFullscreen(true);
    }
  };

  const getMessageText = (message: UIMessage) =>
    message.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");

  const renderChatContent = (containerRef: RefObject<HTMLDivElement | null>) => (
    <div
      ref={containerRef}
      className="absolute inset-x-0 top-0 bottom-16 overflow-y-auto px-4 pt-4 space-y-4"
    >
      {messages.map((message) => {
        const messageText = getMessageText(message);

        return (
        <div key={message.id} className="flex flex-col space-y-1">
          <div className="text-xs font-medium text-gray-500 ml-1">
            {message.role === "user" ? "You" : "Assistant"}:
          </div>
          <div
            className={`rounded-lg p-4 shadow-sm ${
              message.role === "user"
                ? "bg-[#820618] text-white ml-8"
                : "bg-gray-50 border border-gray-100 mr-8"
            }`}
          >
            {message.role === "assistant" ? (
              <ReactMarkdown className="prose prose-sm max-w-none break-words">
                {messageText}
              </ReactMarkdown>
            ) : (
              messageText
            )}
          </div>
        </div>
        );
      })}
    </div>
  );

  const renderChatForm = () => {
    const handleLocalSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void handleFormSubmit(e);
      // Ensure focus is maintained after submission
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    };

    const handleLocalInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      // Ensure input keeps focus
      inputRef.current?.focus();
    };

    return (
      <form
        onSubmit={handleLocalSubmit}
        className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t"
      >
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleLocalInputChange}
            placeholder="Ask a question..."
            className="flex-grow px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#820618] focus:border-transparent bg-gray-50"
            autoFocus
          />
          <Button
            type="submit"
            className="bg-[#820618] hover:bg-[#6a0513] text-white rounded-lg px-4"
            disabled={isLoading || input.trim().length === 0}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    );
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#E3E0DB] text-gray-800">
      <NavBar />
      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Content Column */}
        <div className="w-full lg:w-2/3 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="relative overflow-hidden p-8">
                <CardTitle className="text-4xl font-bold text-[#820618] z-10 relative mb-4">
                  AI-Powered Academic Assistants: Transforming Student
                  Productivity
                </CardTitle>
                <p className="text-lg text-gray-600 z-10 relative">
                  A project by Rabih Daoud and Ali Khreis
                  for SEG 4300
                </p>
                
                {/* New Audio Section */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Project Overview Audio</h3>
                    <p className="text-sm text-gray-600">Listen to a detailed explanation of our research and findings</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Audio Progress Bar */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium min-w-[40px] text-gray-600">
                        {formatTime(currentTime)}
                      </span>
                      <div className="flex-grow">
                        <Slider
                          value={[currentTime]}
                          min={0}
                          max={duration || 100}
                          step={0.1}
                          onValueChange={handleSliderChange}
                          className="w-full"
                          disabled={!duration}
                          aria-label="Audio progress"
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[40px] text-gray-600">
                        {formatTime(duration)}
                      </span>
                    </div>
                    
                    {/* Audio Controls */}
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        onClick={() => skipAudio(-10)}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-gray-100"
                      >
                        <SkipBack className="w-4 h-4 mr-1" />
                        10s
                      </Button>
                      
                      <Button
                        onClick={toggleAudio}
                        size="lg"
                        className="bg-[#820618] hover:bg-[#6a0513] text-white px-6"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => skipAudio(10)}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-gray-100"
                      >
                        <SkipForward className="w-4 h-4 mr-1" />
                        10s
                      </Button>
                    </div>
                  </div>
                  
                  <audio
                    ref={audioRef}
                    src="podcast.wav"
                    preload="metadata"
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('Audio error:', e);
                      setIsPlaying(false);
                    }}
                  />
                </div>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-[#820618]">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Book className="w-8 h-8 text-[#820618]" />
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Many students struggle with meeting deadlines due to workload and have difficulty understanding lectures and course material without adequate support. There&apos;s a lack of effective productivity tools tailored for academic success. AI-powered academic assistants can help by providing personalized support, answering questions, and organizing tasks. This project explores how these AI tools can improve student productivity and make learning easier.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#820618]">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Target className="w-8 h-8 text-[#820618]" />
                <CardTitle>Key Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="hover:text-[#820618]">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>Technology Used</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      We explore AI and machine learning tools used to build academic assistants, including natural language processing for understanding and responding to student questions. Key technologies include Retrieval Augmented Generation (RAG) and Agentic RAG frameworks, which enhance the accuracy and capabilities of AI assistants.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="hover:text-[#820618]">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>User Experience</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      We examine how these assistants personalize learning for each student and review the design of user interfaces to ensure they are easy to use and engaging. AI agents can work with multiple data sources simultaneously, taking actions on behalf of users to create personalized study plans and provide actionable insights.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="hover:text-[#820618]">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-5 h-5" />
                        <span>Challenges and Solutions</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      We identify problems like data privacy and ensuring
                      accurate responses, and find ways to overcome these issues
                      to make AI assistants reliable and trustworthy.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="hover:text-[#820618]">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Impact on Productivity</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      We measure how these tools help students manage their time
                      and improve their grades, looking at examples of schools
                      or programs that have successfully used AI assistants.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#820618]">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Lightbulb className="w-8 h-8 text-[#820618]" />
                <CardTitle>Research Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Our research reveals significant potential in using AI for increasing student productivity, with many effective products developing in recent years. These assistants employ advanced techniques like Retrieval Augmented Generation (RAG) and Agentic RAG frameworks to provide more accurate and context-aware responses.
                </p>
                <p className="text-gray-600">
                  We found that AI assistants play a crucial role in adapting learning processes to individual students. Tools like NotebookLM by Google Labs demonstrate the capability to handle large amounts of data, including student notes and lecture slides, to create personalized study experiences.
                </p>
                <p className="text-gray-600">
                  Interviews with experts like Professor Garzon emphasize that AI should be used as a companion to assist with learning, not to replace genuine academic efforts. The focus is on using AI to support learning and make students more productive without compromising academic integrity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#820618]">
              <CardHeader className="flex flex-row items-center space-x-4">
                <ShieldAlert className="w-8 h-8 text-[#820618]" />
                <CardTitle>Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#820618] rounded-full"></div>
                    <span>Ensuring responsible use of AI tools without compromising learning integrity</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#820618] rounded-full"></div>
                    <span>Balancing AI assistance with traditional learning practices</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#820618] rounded-full"></div>
                    <span>Addressing potential AI hallucination and ensuring accuracy of responses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#820618] rounded-full"></div>
                    <span>Developing foolproof methods to identify AI-generated content in academic work</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#820618]">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Puzzle className="w-8 h-8 text-[#820618]" />
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We plan to continue our research into AI technologies like RAG and Agentic RAG, investigating how they can be applied to create more effective and personalized academic assistants. We will explore the integration of tools like NotebookLM into student workflows and design frameworks for evaluating the impact of AI tools on student productivity and learning outcomes.
                </p>
                <p className="text-gray-600 mt-2">
                  Additionally, we aim to collaborate with educators to develop guidelines for the responsible use of AI in academic settings, ensuring that these tools enhance learning without compromising educational integrity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fullscreen Modal (shown for both desktop maximize and mobile) */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center backdrop-blur-sm">
            <Card className="w-full max-w-4xl h-[90vh] flex flex-col bg-white">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-6 h-6 text-[#820618]" />
                    <span>Project Assistant</span>
                  </CardTitle>
                  <Button
                    onClick={toggleFullscreen}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative flex flex-col h-[calc(100vh-8rem)]">
                {renderChatContent(modalChatContainerRef)}
                {renderChatForm()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Regular Chatbot Column (visible only on larger screens) */}
        <div className="hidden lg:block w-1/3 p-4 sticky top-0 h-screen">
          <Card className="h-full flex flex-col bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-[#820618]" />
                  <span>Project Assistant</span>
                </CardTitle>
                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Ask questions about our AI Academic Assistants project
              </p>
            </CardHeader>
            <CardContent className="relative flex flex-col h-[calc(100vh-8rem)]">
              {renderChatContent(chatContainerRef)}
              {renderChatForm()}
            </CardContent>
          </Card>
        </div>

        {/* Floating Chat Button (visible on mobile) */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={handleMobileChat}
            className="rounded-full w-14 h-14 bg-[#820618] hover:bg-[#6a0513] text-white shadow-lg flex items-center justify-center"
            aria-label="Toggle chat"
          >
            {isChatOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
