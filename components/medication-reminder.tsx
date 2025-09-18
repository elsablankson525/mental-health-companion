"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  Pill, 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  CheckCircle,
  User,
  MapPin,
  FileText
} from "lucide-react"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: Date
  endDate?: Date
  instructions: string
  sideEffects: string[]
  reminders: boolean
  takenToday: boolean
  lastTaken?: Date
}

interface Appointment {
  id: string
  title: string
  type: 'therapy' | 'psychiatry' | 'general' | 'other'
  provider: string
  date: Date
  time: string
  location: string
  notes: string
  reminder: boolean
  completed: boolean
}

export default function MedicationReminder() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showMedDialog, setShowMedDialog] = useState(false)
  const [showApptDialog, setShowApptDialog] = useState(false)
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: '',
    sideEffects: [],
    reminders: true
  })
  const [newAppt, setNewAppt] = useState({
    title: '',
    type: 'therapy' as Appointment['type'],
    provider: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    notes: '',
    reminder: true
  })

  useEffect(() => {
    const savedMeds = localStorage.getItem('medications')
    const savedAppts = localStorage.getItem('appointments')
    
    if (savedMeds) {
      const parsedMeds = JSON.parse(savedMeds).map((med: any) => ({
        ...med,
        startDate: new Date(med.startDate),
        endDate: med.endDate ? new Date(med.endDate) : undefined,
        lastTaken: med.lastTaken ? new Date(med.lastTaken) : undefined
      }))
      setMedications(parsedMeds)
    } else {
      // Load sample medications with Ghana and global context
      setMedications(getSampleMedications())
    }
    
    if (savedAppts) {
      const parsedAppts = JSON.parse(savedAppts).map((appt: any) => ({
        ...appt,
        date: new Date(appt.date)
      }))
      setAppointments(parsedAppts)
    } else {
      // Load sample appointments with Ghana and global context
      setAppointments(getSampleAppointments())
    }
  }, [])

  const getSampleMedications = (): Medication[] => [
    {
      id: "gh-1",
      name: "Fluoxetine",
      dosage: "20mg",
      frequency: "daily",
      times: ["08:00"],
      startDate: new Date('2024-01-01'),
      instructions: "Take with food. Common antidepressant in Ghana. May take 2-4 weeks to see effects.",
      sideEffects: ["Nausea", "Headache", "Insomnia"],
      reminders: true,
      takenToday: false
    },
    {
      id: "gh-2",
      name: "Diazepam",
      dosage: "5mg",
      frequency: "as needed",
      times: ["20:00"],
      startDate: new Date('2024-01-15'),
      instructions: "Take only when experiencing severe anxiety. Do not exceed 3 times per week.",
      sideEffects: ["Drowsiness", "Dizziness"],
      reminders: true,
      takenToday: false
    },
    {
      id: "gl-1",
      name: "Sertraline",
      dosage: "50mg",
      frequency: "daily",
      times: ["09:00"],
      startDate: new Date('2024-01-10'),
      instructions: "Take with breakfast. Monitor mood changes and report any side effects to your doctor.",
      sideEffects: ["Dry mouth", "Fatigue", "Weight changes"],
      reminders: true,
      takenToday: false
    },
    {
      id: "gl-2",
      name: "Lorazepam",
      dosage: "1mg",
      frequency: "as needed",
      times: ["21:00"],
      startDate: new Date('2024-01-20'),
      instructions: "For acute anxiety episodes only. Maximum 2mg per day.",
      sideEffects: ["Sedation", "Memory issues"],
      reminders: true,
      takenToday: false
    }
  ]

  const getSampleAppointments = (): Appointment[] => [
    {
      id: "gh-1",
      title: "Follow-up with Dr. Kwame Asante",
      type: "psychiatry",
      provider: "Dr. Kwame Asante",
      date: new Date('2024-01-25'),
      time: "10:00",
      location: "Accra Psychiatric Hospital, Accra",
      notes: "Review medication effectiveness and discuss traditional healing integration",
      reminder: true,
      completed: false
    },
    {
      id: "gh-2",
      title: "Therapy Session",
      type: "therapy",
      provider: "Dr. Ama Serwaa",
      date: new Date('2024-01-28'),
      time: "14:00",
      location: "Kumasi Mental Health Center",
      notes: "Cognitive behavioral therapy focusing on anxiety management",
      reminder: true,
      completed: false
    },
    {
      id: "gl-1",
      title: "Psychiatric Consultation",
      type: "psychiatry",
      provider: "Dr. Sarah Johnson",
      date: new Date('2024-01-30'),
      time: "11:00",
      location: "Online Session",
      notes: "Medication review and treatment plan adjustment",
      reminder: true,
      completed: false
    },
    {
      id: "gl-2",
      title: "Group Therapy Session",
      type: "therapy",
      provider: "Dr. Maria Rodriguez",
      date: new Date('2024-02-02'),
      time: "16:00",
      location: "Community Mental Health Center",
      notes: "Cross-cultural mental health support group",
      reminder: true,
      completed: false
    }
  ]

  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications))
  }, [medications])

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments))
  }, [appointments])

  const addMedication = () => {
    if (!newMed.name.trim()) return

    const medication: Medication = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage,
      frequency: newMed.frequency,
      times: newMed.times,
      startDate: new Date(newMed.startDate),
      ...(newMed.endDate && { endDate: new Date(newMed.endDate) }),
      instructions: newMed.instructions,
      sideEffects: newMed.sideEffects,
      reminders: newMed.reminders,
      takenToday: false
    }

    setMedications(prev => [...prev, medication])
    resetNewMed()
    setShowMedDialog(false)
  }

  const addAppointment = () => {
    if (!newAppt.title.trim() || !newAppt.provider.trim()) return

    const appointment: Appointment = {
      id: Date.now().toString(),
      title: newAppt.title,
      type: newAppt.type,
      provider: newAppt.provider,
      date: new Date(newAppt.date),
      time: newAppt.time,
      location: newAppt.location,
      notes: newAppt.notes,
      reminder: newAppt.reminder,
      completed: false
    }

    setAppointments(prev => [...prev, appointment])
    resetNewAppt()
    setShowApptDialog(false)
  }

  const markMedicationTaken = (medId: string) => {
    setMedications(prev => prev.map(med => 
      med.id === medId 
        ? { ...med, takenToday: true, lastTaken: new Date() }
        : med
    ))
  }

  const markAppointmentCompleted = (apptId: string) => {
    setAppointments(prev => prev.map(appt => 
      appt.id === apptId 
        ? { ...appt, completed: true }
        : appt
    ))
  }

  const deleteMedication = (medId: string) => {
    setMedications(prev => prev.filter(med => med.id !== medId))
  }

  const deleteAppointment = (apptId: string) => {
    setAppointments(prev => prev.filter(appt => appt.id !== apptId))
  }

  const resetNewMed = () => {
    setNewMed({
      name: '',
      dosage: '',
      frequency: 'daily',
      times: ['08:00'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      instructions: '',
      sideEffects: [],
      reminders: true
    })
  }

  const resetNewAppt = () => {
    setNewAppt({
      title: '',
      type: 'therapy',
      provider: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      location: '',
      notes: '',
      reminder: true
    })
  }

  const getUpcomingAppointments = () => {
    const today = new Date()
    return appointments
      .filter(appt => appt.date >= today && !appt.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3)
  }

  const getTodaysMedications = () => {
    return medications.filter(med => !med.takenToday)
  }

  const getMedicationStats = () => {
    const totalMeds = medications.length
    const takenToday = medications.filter(med => med.takenToday).length
    const upcomingAppts = appointments.filter(appt => 
      appt.date >= new Date() && !appt.completed
    ).length
    
    return { totalMeds, takenToday, upcomingAppts }
  }

  const stats = getMedicationStats()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medication & Reminders</h1>
          <p className="text-muted-foreground">Track medications and manage healthcare appointments</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showMedDialog} onOpenChange={setShowMedDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Pill className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="med-name">Medication Name</Label>
                    <Input
                      id="med-name"
                      value={newMed.name}
                      onChange={(e) => setNewMed(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Sertraline"
                    />
                  </div>
                  <div>
                    <Label htmlFor="med-dosage">Dosage</Label>
                    <Input
                      id="med-dosage"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 50mg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="med-frequency">Frequency</Label>
                    <Select value={newMed.frequency} onValueChange={(value) => setNewMed(prev => ({ ...prev, frequency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="twice-daily">Twice Daily</SelectItem>
                        <SelectItem value="three-times">Three Times Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="as-needed">As Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="med-start">Start Date</Label>
                    <Input
                      id="med-start"
                      type="date"
                      value={newMed.startDate}
                      onChange={(e) => setNewMed(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="med-instructions">Instructions</Label>
                  <Textarea
                    id="med-instructions"
                    value={newMed.instructions}
                    onChange={(e) => setNewMed(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Take with food, avoid alcohol, etc."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="med-reminders"
                    checked={newMed.reminders}
                    onCheckedChange={(checked) => setNewMed(prev => ({ ...prev, reminders: checked }))}
                  />
                  <Label htmlFor="med-reminders">Enable reminders</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowMedDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addMedication}>
                    Add Medication
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showApptDialog} onOpenChange={setShowApptDialog}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appt-title">Title</Label>
                    <Input
                      id="appt-title"
                      value={newAppt.title}
                      onChange={(e) => setNewAppt(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Therapy Session"
                    />
                  </div>
                  <div>
                    <Label htmlFor="appt-type">Type</Label>
                    <Select value={newAppt.type} onValueChange={(value: Appointment['type']) => setNewAppt(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="therapy">Therapy</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="general">General Health</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="appt-provider">Provider</Label>
                  <Input
                    id="appt-provider"
                    value={newAppt.provider}
                    onChange={(e) => setNewAppt(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g., Dr. Smith"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appt-date">Date</Label>
                    <Input
                      id="appt-date"
                      type="date"
                      value={newAppt.date}
                      onChange={(e) => setNewAppt(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appt-time">Time</Label>
                    <Input
                      id="appt-time"
                      type="time"
                      value={newAppt.time}
                      onChange={(e) => setNewAppt(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="appt-location">Location</Label>
                  <Input
                    id="appt-location"
                    value={newAppt.location}
                    onChange={(e) => setNewAppt(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., 123 Main St, City"
                  />
                </div>

                <div>
                  <Label htmlFor="appt-notes">Notes</Label>
                  <Textarea
                    id="appt-notes"
                    value={newAppt.notes}
                    onChange={(e) => setNewAppt(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any notes or topics to discuss..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="appt-reminder"
                    checked={newAppt.reminder}
                    onCheckedChange={(checked) => setNewAppt(prev => ({ ...prev, reminder: checked }))}
                  />
                  <Label htmlFor="appt-reminder">Enable reminder</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowApptDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addAppointment}>
                    Add Appointment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taken Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.takenToday}/{stats.totalMeds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppts}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5" />
                  <span>Today's Medications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTodaysMedications().length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">All medications taken for today!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getTodaysMedications().map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{med.name}</div>
                          <div className="text-sm text-muted-foreground">{med.dosage}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => markMedicationTaken(med.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Taken
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Appointments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getUpcomingAppointments().length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getUpcomingAppointments().map((appt) => (
                      <div key={appt.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{appt.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {appt.provider} • {appt.date.toLocaleDateString()} at {appt.time}
                            </div>
                            {appt.location && (
                              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{appt.location}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAppointmentCompleted(appt.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          {medications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Medications Added</h3>
                <p className="text-muted-foreground mb-4">Start tracking your medications to stay on top of your health</p>
                <Button onClick={() => setShowMedDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Medication
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {medications.map((med) => (
                <Card key={med.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{med.name}</h3>
                          <Badge variant="outline">{med.dosage}</Badge>
                          {med.takenToday && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Taken Today
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {med.frequency} • Started {med.startDate.toLocaleDateString()}
                        </div>
                        {med.instructions && (
                          <div className="text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 inline mr-1" />
                            {med.instructions}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* TODO: Implement edit medication */}}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMedication(med.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Times: {med.times.join(', ')}</span>
                        </div>
                        {med.reminders && (
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <Bell className="h-3 w-3" />
                            <span>Reminders On</span>
                          </Badge>
                        )}
                      </div>
                      {!med.takenToday && (
                        <Button
                          onClick={() => markMedicationTaken(med.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Taken
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Appointments Added</h3>
                <p className="text-muted-foreground mb-4">Keep track of your healthcare appointments</p>
                <Button onClick={() => setShowApptDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((appt) => (
                  <Card key={appt.id} className={appt.completed ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{appt.title}</h3>
                            <Badge variant="outline">{appt.type}</Badge>
                            {appt.completed && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <User className="h-4 w-4 inline mr-1" />
                            {appt.provider}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {appt.date.toLocaleDateString()} at {appt.time}
                          </div>
                          {appt.location && (
                            <div className="text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {appt.location}
                            </div>
                          )}
                          {appt.notes && (
                            <div className="text-sm text-muted-foreground">
                              <FileText className="h-4 w-4 inline mr-1" />
                              {appt.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {!appt.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAppointmentCompleted(appt.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Implement edit appointment */}}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAppointment(appt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {appt.reminder && (
                      <CardContent>
                        <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                          <Bell className="h-3 w-3" />
                          <span>Reminder Enabled</span>
                        </Badge>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
