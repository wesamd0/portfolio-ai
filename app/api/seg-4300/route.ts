import { groq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";

const projectContext = `
AI-Powered Academic Assistants: Transforming Student Productivity

This project explores how AI-powered academic assistants can improve student productivity and learning outcomes. Key aspects include:

1. Technology Used:
- Retrieval Augmented Generation (RAG)
- Agentic RAG frameworks
- Natural language processing
- Machine learning tools

2. Research Findings:
- AI assistants show significant potential for increasing student productivity
- Tools like NotebookLM demonstrate capability to handle large amounts of data
- Experts emphasize AI should complement, not replace, genuine academic efforts

3. Challenges:
- Ensuring responsible use without compromising learning integrity
- Balancing AI assistance with traditional learning
- Addressing AI hallucination and accuracy
- Developing methods to identify AI-generated content

4. Next Steps:
- Continue research into RAG and Agentic RAG
- Explore integration with student workflows
- Develop guidelines for responsible AI use in academia

ONLY ANSWER QUESTIONS RELATED TO THE PROJECT. DO NOT ANSWER QUESTIONS NOT RELATED TO THE PROJECT. USE THE PROJECT CONTEXT TO ANSWER THE QUESTIONS. 
THE SCRIPT AS WELL AS THE PRESENTATION ARE PROVIDED TO YOU AS CONTEXT. USE THEM TO ANSWER THE QUESTIONS OR YOU WILL BE PENALIZED.

<script>
Rabih: We’re gonna be talking to you how ai can be productive, based on the last presentations, you def have used chat gpt so we’re not gonna talk to you how it works blah blah but how we can utilise these eLLMs and add sone context to them that make you productive and excel in your classes. I’m Rabih Daoud, next to me is my partner Ali Khreis and we’re gonna be talking about AI powered AI assistance that will transform student productivity. 




Ali: Thank you Rabih, you mentioned adding context to the LLM’s, this is what we call in the industry RAG my friend. 

Rabih - What is RAG?

Ali: RAG stands for Retrieval Augmented Generation. What it does is combine external data with the LLM to generate accurate and relevant responses on what your prompt is. For example, I asked chatgpt about Wasim’s policy on late submission for SEG 4300 and very confidently it told me there is no penalties and that’s what call AI hallucination, Hallucination is when the AI tries to guess an answer based on pre trained parameters for the LLM however with the RAG, we give the LLM a clear path to fetch relevant information to users prompt.

Rabih: Ok how are you going to use the RAG framework to get it to say an accurate response. 

Ali: Now we are going to talk about how the RAG framework works. If you look at this diagram we see that the user’s prompt is being enriched with context from a data source such as a PDF or a vector database. This retrieval adds the context from wassim’s syllabus into the LLM/AI and now it is grounding its answer from the data store. As an example professor Wassim has updated his grading scheme through out the semester we just add to the data rather than retraining the LLM. However this is not a bullet proof approach as we might have lots of data where we fetch the incorrect thing or fetch nothing, and in that case although we have an answer for the user’s question in the data store. The LLM will tell us that it has no clue or when it hasn’t found a reliable answer as we have prompted it to only answer when it is pretty certain. Now the industry is actively working on improving both the LLM as well as the retrieval side so that the user is getting good output and the most accurate information. 


Rabih: Well this is cool but its a bit basic just text in and text out. I can’t manage time my time at all, between school my job and my business i get lost. Can a rag take my syllabus and schedule time for me to study? 

Ali: Great Question Rabih! This is what we call an agentic RAG framework. As you all have used AI, you can tell when you ask it to do many things, it gets lost and it starts hallucinating. AI Excels at specific tasks with generic LLM as we have seen before, the LLM was only called once to generate an output based on a prompt with additional context. Now what if we let the LLM use its natural language processing power to take actions and improve the overall output. As you can see in the diagram, before we finalise the prompt that goes to the LLM for generation, we’re gonna add a couple agents. Think of an agent as an intern who’s really good at one specific action. For example, an intern who looks at your work calendar, school calendar and syllabus for assignments and exams, and its sole purpose is to schedule study times for you via google calendar. 


Rabih:  So you're telling me that AI is not text in text out, it can actually take actions on my behalf! And based on what you’re saying, it wont only look at one vector base but will look at many things at the same time. So I’m assuming I can add an intern/agent that I can give it wasim's boring uhh amazing slides and it can generate a study plan for me? This is great as it is not just basic LLM and it is able to add to what we can do as students. I recently interviewed Solace’s Chief AI Officer and you can see in the diagram where they take a response from a source and use an orchestrator that takes the prompt and then pass it to an agent to either take an action, or retrieve information. 




As Rabih interviewed his company's AI officer on the current tech, we interviewed professor’s Garzon to discuss how these tools don’t do your work like make the presentation and write the script for it but to be used as a companion to help you achieve your academic goals. Now unfortunately for us we are in software engineering and our professors like Wassim are very knowledgeable and can detect when things are AI generated quickly because they are in the industry and interacting with AI models on daily basis, however, there’s many areas and different facilities where we need to teach on the use of AI (Things like gpt0 and other AI detectors can’t be trusted 100% of the time) to make sure these tools aren’t replacing traditional learnings but are companions to make you more productive and enhance your learning experience we currently lack this.
</script>

<presentation>
AI-Powered Academic
Assistants Transforming
Student Productivity
Rabih Daoud & Ali Khreis
The Challenge
• Many students struggle with meeting deadlines due to
workload
• Difficulty understanding lectures and course material
without adequate support
• Lack of effective productivity tools tailored for academic
success
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
Leveraging AI for Productivity
• Adding specific context to LLMs to improve relevance
and accuracy
• Moving beyond basic "text in, text out" responses to
actionable insights
• AI as a powerful companion for students to boost
productivity and academic performance
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
What is RAG?
• RAG (Retrieval Augmented Generation): Integrates external data
with LLMs for accurate responses.
• AI Hallucination: Occurs when the LLM guesses answers based on
pre-trained data.
• RAG Advantage: Retrieves relevant information, reducing
hallucination and enhancing accuracy.
Basic LLM Interaction
RAG
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
Agentic RAG Framework
• Agentic RAG: Extending RAG by allowing AI to take specific
actions autonomously
• Uses specialized "agents" to perform focused tasks, like an
intern specializing in a specific duty
• AI capabilities go beyond "text in, text out" responses
• Agents can work with multiple data sources simultaneously,
taking actions on behalf of users
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
Agentic RAG Framework
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
Agentic RAG Framework
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
AI Agents in Action
• AI capabilities go beyond "text in, text out" responses
• Agents can work with multiple data sources
simultaneously, taking actions on behalf of users
• Example: Agents use Wassim's lecture slides to create a
personalized study plan, including key focus areas and
timelines
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
AI Agents in Action
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
Future trends
• Interviewed Professor Garzon: AI should be used as a
companion to assist with learning, not to replace genuine
academic efforts
• AI tools can aid in research, content generation, and
productivity, but traditional learning practices remain essential
• Teaching responsible use of AI ensures these tools are
enhancing learning instead of creating shortcuts
• AI tools like GPT-0 and other detectors aren’t foolproof in
identifying AI-generated content
• The focus should be on using AI to support learning, making
students more productive without compromising integrity
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
Current Tools
• NotebookLM: AI-powered research and note-taking tool by Google Labs
• Uses Google's Gemini AI to enhance interaction with documents
• Key features: Generate summaries, explanations, and answers from uploaded content
(PDFs, Google Docs, web URLs, etc.)
• Practical uses: Summarize lecture notes, create study guides, and engage with course
materials in a more interactive way
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
Agentic RAG to Manage Your Time
Medical Law and Ethics, Fifth Edition
Copyright © 2016, 2012, 2009 by Pearson Education, Inc.
Bonnie F. FremgenCopyright © 2016, 2011, 2006 Pearson Education, Inc. All Rights Reserved
All Rights Reserved
</presentation>
`;

const model = groq("llama-3.3-70b-versatile");

export async function POST(req: NextRequest) {
  try {
    const { messages = [] } = (await req.json()) as { messages?: UIMessage[] };

    const result = streamText({
      model,
      temperature: 0.7,
      maxOutputTokens: 1000,
      system: `You are a helpful assistant for the AI-Powered Academic Assistants project. Use the following context to answer questions:\n\n${projectContext}`,
      messages: await convertToModelMessages(messages.slice(-5)),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
