import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail, Plus, Shield, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

export default function Team() {
  // Mocking team data since we can't fully invite users in this demo environment without emails
  // In a real app, this would fetch from base44.entities.User.list() if we had admin access
  const [members, setMembers] = React.useState([
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', role: 'Member', status: 'Active' },
    { id: 3, name: 'Mike Brown', email: 'mike@example.com', role: 'Viewer', status: 'Pending' },
  ]);

  const handleRoleChange = (id, newRole) => {
    setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Members</h1>
          <p className="text-slate-500 mt-1">Manage access and roles for your workspace.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Mail className="w-4 h-4 mr-2" /> Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Members</CardTitle>
          <CardDescription>People with access to this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="divide-y divide-slate-100">
             {members.map((member) => (
               <div key={member.id} className="py-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Avatar>
                     <AvatarFallback className="bg-indigo-50 text-indigo-600">
                       {member.name.charAt(0)}
                     </AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="font-medium text-slate-900">{member.name}</p>
                     <p className="text-sm text-slate-500">{member.email}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                   <Badge variant={member.status === 'Active' ? 'default' : 'secondary'} className={member.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700'}>
                     {member.status}
                   </Badge>
                   
                   <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                     <Shield className="w-3 h-3" />
                     {member.role}
                   </div>

                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'Admin')}>
                           Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'Member')}>
                           Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'Viewer')}>
                           Viewer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
               </div>
             ))}
           </div>
        </CardContent>
      </Card>

      <Card className="mt-8 border-dashed bg-slate-50">
        <CardContent className="py-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
            <Plus className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-medium text-slate-900">Invite more people</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-sm">
            Collaborate with your team by inviting them to this workspace.
          </p>
          <div className="flex gap-2 w-full max-w-md">
            <Input placeholder="Enter email address..." />
            <Button variant="secondary">Send Invite</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}