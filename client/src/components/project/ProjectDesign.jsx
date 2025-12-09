import React from 'react';
import { 
  Database, 
  Server, 
  Globe, 
  ArrowRight, 
  Table, 
  Code, 
  FileJson,
  Plus, 
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock Data for Design Spec
const ARCHITECTURE = [
  { id: 1, name: 'Frontend App', type: 'service', icon: Globe, desc: 'React SPA hosted on Vercel' },
  { id: 2, name: 'API Gateway', type: 'service', icon: Server, desc: 'Node.js / Express' },
  { id: 3, name: 'Main Database', type: 'database', icon: Database, desc: 'PostgreSQL' },
  { id: 4, name: 'Auth Service', type: 'external', icon: Lock, desc: 'Auth0 / Firebase' },
];

const SCHEMA = [
  { 
    name: 'User', 
    fields: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'role', type: 'enum', notes: 'admin, member, viewer' }
    ]
  },
  { 
    name: 'Project', 
    fields: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'owner_id', type: 'uuid', notes: 'FK -> User.id' }
    ]
  }
];

const API_ENDPOINTS = [
  { method: 'GET', path: '/projects', desc: 'List all projects' },
  { method: 'POST', path: '/projects', desc: 'Create a new project' },
  { method: 'GET', path: '/projects/:id', desc: 'Get project details' },
  { method: 'PATCH', path: '/projects/:id', desc: 'Update project' },
];

export default function ProjectDesign({ projectId }) {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Design</h2>
          <p className="text-slate-500">Architecture, Schema, and API specifications.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Spec
        </Button>
      </div>

      <Tabs defaultValue="architecture">
        <TabsList>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {ARCHITECTURE.map(item => (
               <Card key={item.id} className="relative overflow-hidden border-l-4 border-l-indigo-500">
                 <CardContent className="p-6">
                   <div className="flex items-start justify-between mb-4">
                     <div className={`p-3 rounded-lg bg-slate-50`}>
                       <item.icon className="w-6 h-6 text-indigo-600" />
                     </div>
                     <Badge variant="outline" className="capitalize">{item.type}</Badge>
                   </div>
                   <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                   <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                 </CardContent>
               </Card>
             ))}
             
             <Card className="border-dashed border-2 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors h-[180px]">
               <div className="text-center">
                 <Plus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                 <span className="text-sm font-medium text-slate-500">Add Component</span>
               </div>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="schema" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {SCHEMA.map(table => (
              <Card key={table.name}>
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-slate-500" />
                    <CardTitle className="text-base font-mono text-indigo-600">{table.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase">
                      <tr>
                        <th className="px-6 py-3 font-medium">Field</th>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {table.fields.map(field => (
                        <tr key={field.name} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-mono text-slate-700 flex items-center gap-2">
                            {field.name}
                            {field.required && <span className="text-[10px] text-red-500 font-bold">*</span>}
                          </td>
                          <td className="px-6 py-3 text-blue-600 font-mono text-xs">{field.type}</td>
                          <td className="px-6 py-3 text-slate-400 italic">{field.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <div className="space-y-4">
            {API_ENDPOINTS.map((api, i) => (
              <div key={i} className="flex items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                <Badge className={`mr-4 w-16 justify-center ${
                  api.method === 'GET' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                  api.method === 'POST' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                  api.method === 'DELETE' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                  'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}>
                  {api.method}
                </Badge>
                <code className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded mr-6">
                  {api.path}
                </code>
                <span className="text-sm text-slate-600 flex-1">{api.desc}</span>
                <Button variant="ghost" size="sm">Details</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}