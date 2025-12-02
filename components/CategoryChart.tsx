import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Athlete, Category } from '../types';

interface CategoryChartProps {
  athletes: Athlete[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b'];

export const CategoryChart: React.FC<CategoryChartProps> = ({ athletes }) => {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(Category).forEach(cat => counts[cat] = 0);
    
    athletes.forEach(a => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      }
    });

    return Object.keys(counts)
      .filter(key => counts[key] > 0)
      .map(key => ({
        name: key,
        value: counts[key]
      }));
  }, [athletes]);

  if (athletes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
        <p>Nenhum atleta cadastrado</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Distribuição por Categoria</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
