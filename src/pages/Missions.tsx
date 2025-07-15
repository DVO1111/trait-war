import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Star,
  Clock,
  Users,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Code,
  BookOpen,
  Vote,
  Zap
} from "lucide-react";

const missionCategories = [
  { id: "all", name: "All Missions", icon: Target },
  { id: "tech", name: "Tech & Build", icon: Code },
  { id: "community", name: "Community", icon: Users },
  { id: "governance", name: "Governance", icon: Vote },
  { id: "education", name: "Education", icon: BookOpen }
];

const missions = [
  {
    id: "1",
    title: "Build a Solana NFT Marketplace",
    description: "Create a fully functional NFT marketplace on Solana with minting, buying, and selling capabilities",
    category: "tech",
    xp: 300,
    difficulty: "Advanced",
    timeLeft: "6 days",
    participants: 24,
    creator: "DAO Treasury",
    isOfficial: true,
    requirements: ["Solana development experience", "React/TypeScript", "Anchor framework"],
    deliverables: ["GitHub repository", "Live demo", "Documentation"]
  },
  {
    id: "2", 
    title: "Write DeFi Security Guide",
    description: "Create a comprehensive guide on DeFi security best practices for new users",
    category: "education",
    xp: 120,
    difficulty: "Intermediate",
    timeLeft: "3 days",
    participants: 8,
    creator: "SecurityDAO",
    isOfficial: true,
    requirements: ["DeFi experience", "Technical writing skills"],
    deliverables: ["Written guide (3000+ words)", "Code examples", "Infographics"]
  },
  {
    id: "3",
    title: "Community Discord Bot",
    description: "Build a Discord bot to help manage community activities and XP tracking",
    category: "community",
    xp: 180,
    difficulty: "Intermediate", 
    timeLeft: "1 week",
    participants: 15,
    creator: "Builder_0x89",
    isOfficial: false,
    requirements: ["JavaScript/Python", "Discord API experience"],
    deliverables: ["Working bot", "Setup instructions", "Feature documentation"]
  },
  {
    id: "4",
    title: "DAO Treasury Proposal Review",
    description: "Review and provide feedback on the Q1 2024 treasury allocation proposal",
    category: "governance",
    xp: 50,
    difficulty: "Beginner",
    timeLeft: "18 hours",
    participants: 89,
    creator: "DAO Treasury",
    isOfficial: true,
    requirements: ["DAO membership", "Basic understanding of tokenomics"],
    deliverables: ["Detailed review", "Vote submission", "Forum discussion participation"]
  },
  {
    id: "5",
    title: "Beginner Rust Workshop",
    description: "Host a live workshop teaching Rust basics for blockchain development",
    category: "education",
    xp: 200,
    difficulty: "Advanced",
    timeLeft: "2 weeks",
    participants: 5,
    creator: "RustGuru_42",
    isOfficial: false,
    requirements: ["Expert Rust knowledge", "Teaching experience", "Video setup"],
    deliverables: ["Live workshop", "Recording", "Exercise materials"]
  }
];

export default function Missions() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const filteredMissions = missions.filter(mission => {
    const matchesCategory = selectedCategory === "all" || mission.category === selectedCategory;
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-primary/20 text-primary border-primary/30";
      case "Intermediate": return "bg-accent/20 text-accent border-accent/30";
      case "Advanced": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = missionCategories.find(cat => cat.id === category);
    return categoryData?.icon || Target;
  };

  const selectedMissionData = missions.find(m => m.id === selectedMission);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-xp bg-clip-text text-transparent">
            Mission Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover missions, earn XP, and level up your traits
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-neon">
          <Plus className="mr-2 h-4 w-4" />
          Create Mission
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="bg-gradient-mission border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search missions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missionCategories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-neon' 
                        : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Missions Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredMissions.map((mission) => {
              const CategoryIcon = getCategoryIcon(mission.category);
              return (
                <Card 
                  key={mission.id}
                  className={`cursor-pointer transition-all border ${
                    selectedMission === mission.id 
                      ? 'border-primary shadow-neon bg-gradient-cyber' 
                      : 'border-border hover:border-primary/50 bg-gradient-mission'
                  }`}
                  onClick={() => setSelectedMission(selectedMission === mission.id ? null : mission.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                        {mission.isOfficial && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                            Official
                          </Badge>
                        )}
                      </div>
                      <Badge className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mission.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-xp-gold" />
                        <span className="text-xp-gold font-medium">{mission.xp} XP</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mission.timeLeft}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {mission.participants}
                      </span>
                    </div>

                    {selectedMission === mission.id && (
                      <div className="border-t border-border pt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {mission.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Deliverables:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {mission.deliverables.map((deliverable, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-accent rounded-full" />
                                {deliverable}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-primary hover:bg-primary/90">
                            <Zap className="mr-2 h-4 w-4" />
                            Start Mission
                          </Button>
                          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedMission !== mission.id && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                          Start Mission
                        </Button>
                        <Button size="sm" variant="outline" className="border-muted">
                          Details
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}