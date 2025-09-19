'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Mail, Lock, User, Phone } from 'lucide-react';

export default function LoginPage() {
  const [playerForm, setPlayerForm] = useState({
    email: '',
    password: ''
  });

  const [ownerForm, setOwnerForm] = useState({
    email: '',
    password: ''
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-4">
            <div className="bg-green-500 rounded-lg p-2 mr-3">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">TurfBook</h1>
              <p className="text-xs text-gray-500">Sangli & Miraj</p>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="player" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="player">Player</TabsTrigger>
                <TabsTrigger value="owner">Turf Owner</TabsTrigger>
              </TabsList>
              
              <TabsContent value="player">
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="player-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="player-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={playerForm.email}
                        onChange={(e) => setPlayerForm({...playerForm, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="player-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="player-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={playerForm.password}
                        onChange={(e) => setPlayerForm({...playerForm, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button className="w-full bg-green-500 hover:bg-green-600" size="lg">
                    Sign In as Player
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="owner">
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="owner-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="owner-email"
                        type="email"
                        placeholder="owner@example.com"
                        className="pl-10"
                        value={ownerForm.email}
                        onChange={(e) => setOwnerForm({...ownerForm, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="owner-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="owner-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={ownerForm.password}
                        onChange={(e) => setOwnerForm({...ownerForm, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                    Sign In as Owner
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:underline">
                Forgot your password?
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-green-600 hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}