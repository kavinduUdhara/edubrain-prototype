import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';

const nodes = [
  { id: '1', position: { x: 250, y: 5 }, data: { label: 'Root Node' } },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Child Node 1' } },
  { id: '3', position: { x: 400, y: 100 }, data: { label: 'Child Node 2' } },
];

const edges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

const UnitsFlowChart = () => <ReactFlow nodes={nodes} edges={edges} fitView />;

export default UnitsFlowChart;
