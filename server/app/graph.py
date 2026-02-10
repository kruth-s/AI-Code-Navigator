from langgraph.graph import StateGraph, START, END
from typing import Dict, Any

from .state import AgentState
from .agents import PlannerAgent, RetrievalAgent, ReasoningAgent, GitHubAgent, SafetyAgent
from .services.llm import get_llm
from .services.tools import get_all_tools

llm = get_llm()
tools = get_all_tools()

planner = PlannerAgent(llm)
retriever = RetrievalAgent(llm, tools)
reasoner = ReasoningAgent(llm)
github = GitHubAgent(llm, tools)
safety = SafetyAgent(llm)

# Define nodes

async def planning_node(state: AgentState):
    plan = await planner.plan_task(state["input"])
    return {"plan": plan["plan"]}

async def retrieval_node(state: AgentState):
    # Depending on plan, decide what to look up
    # This is a simplification
    repo_id = state.get("repo_id")  # Get repo_id from state
    context = await retriever.retrieve_context([state["input"]], repo_id=repo_id)
    return {"context": context["context"]}

async def github_node(state: AgentState):
    # Only if relevant - for now assume always execute if part of plan?
    # Or separate execution path.
    # To keep simple, we'll just check if query is related to github
    if "issue" in state["input"]:
        # Mock issues for now
        return {"github_data": ["Found issue #123"]}
    return {"github_data": []}

async def reasoning_node(state: AgentState):
    full_context = state.get("context", []) + state.get("github_data", [])
    answer = await reasoner.generate_answer(state["input"], full_context)
    return {"answer": answer["answer"]}

async def safety_node(state: AgentState):
    review = await safety.check_response(state["answer"])
    # If bad, modify or flag. For now assume good.
    return {"final_output": {"answer": state["answer"], "confidence": "high", "sources": []}}

# Build graph
workflow = StateGraph(AgentState)

workflow.add_node("planner", planning_node)
workflow.add_node("retriever", retrieval_node)
workflow.add_node("github", github_node)
workflow.add_node("reasoner", reasoning_node)
workflow.add_node("safety", safety_node)

workflow.add_edge(START, "planner")
workflow.add_edge("planner", "retriever")
workflow.add_edge("retriever", "github")
workflow.add_edge("github", "reasoner") 
workflow.add_edge("reasoner", "safety")
workflow.add_edge("safety", END)

app_graph = workflow.compile()
