import { DevTools } from "@effect/experimental";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Graph, Option } from "effect";

const findNodeInMap = <K, V>(map: Map<K, V>, key: K): V => {
  const node = map.get(key);
  if (node === undefined) throw new Error(`Node ${key} not found in map`);
  return node;
};

// ============================================================================
// EXTREMELY COMPLEX BFS SOCIAL NETWORK EXAMPLE
// ============================================================================

type Person = {
  id: string;
  name: string;
  job: string;
  company?: string;
  location: string;
  industry: string;
  interests: string[];
  experience: number; // years
  education: string[];
  skills: string[];
  influence: number; // 1-10 scale
};

type Connection = {
  strength: number; // 1-10
  context: string;
  type: "professional" | "personal" | "academic" | "community";
  since: number; // year
};

const massiveSocialNetworkExample = Effect.gen(function* () {
  yield* Effect.log(
    "🚀 EXTREME BFS: Massive Social Network Analysis (80+ People, 200+ Connections)"
  );
  yield* Effect.log(
    "This demonstrates real-world scale social network analysis using BFS algorithms\n"
  );

  // MASSIVE social network with 85+ people across 12 cities and 15+ industries
  const people: Person[] = [
    // ===== TECH INDUSTRY - San Francisco/Silicon Valley =====
    {
      id: "alice",
      name: "Alice Chen",
      job: "Senior Software Engineer",
      company: "Meta",
      location: "San Francisco",
      industry: "Technology",
      interests: ["React", "GraphQL", "Machine Learning", "Open Source"],
      experience: 8,
      education: ["Stanford CS"],
      skills: ["React", "Node.js", "Python", "TensorFlow"],
      influence: 8,
    },
    {
      id: "bob",
      name: "Bob Rodriguez",
      job: "Product Manager",
      company: "Google",
      location: "Mountain View",
      industry: "Technology",
      interests: ["Product Strategy", "AI Ethics", "UX Research"],
      experience: 10,
      education: ["Berkeley MBA"],
      skills: ["Product Management", "Data Analysis", "Leadership"],
      influence: 9,
    },
    {
      id: "carol",
      name: "Carol Kim",
      job: "UX Designer",
      company: "Apple",
      location: "Cupertino",
      industry: "Technology",
      interests: ["Design Systems", "Accessibility", "User Research"],
      experience: 7,
      education: ["RISD Design"],
      skills: ["Figma", "Sketch", "Prototyping", "Research"],
      influence: 7,
    },
    {
      id: "david",
      name: "David Patel",
      job: "DevOps Engineer",
      company: "Netflix",
      location: "Los Gatos",
      industry: "Technology",
      interests: ["Kubernetes", "Infrastructure", "Site Reliability"],
      experience: 9,
      education: ["MIT Computer Science"],
      skills: ["Docker", "Kubernetes", "AWS", "Terraform"],
      influence: 8,
    },
    {
      id: "eve",
      name: "Eve Johnson",
      job: "Data Scientist",
      company: "Uber",
      location: "San Francisco",
      industry: "Technology",
      interests: ["Statistics", "Deep Learning", "A/B Testing"],
      experience: 6,
      education: ["Carnegie Mellon Statistics"],
      skills: ["Python", "R", "SQL", "PyTorch"],
      influence: 7,
    },
    {
      id: "frank",
      name: "Frank Miller",
      job: "Engineering Director",
      company: "Stripe",
      location: "San Francisco",
      industry: "Technology",
      interests: ["Engineering Leadership", "Scalability", "Team Building"],
      experience: 12,
      education: ["Harvard CS"],
      skills: ["Leadership", "System Design", "Mentoring"],
      influence: 9,
    },
    {
      id: "grace",
      name: "Grace Lee",
      job: "Frontend Engineer",
      company: "Airbnb",
      location: "San Francisco",
      industry: "Technology",
      interests: ["React", "TypeScript", "Performance"],
      experience: 5,
      education: ["UC Berkeley CS"],
      skills: ["React", "TypeScript", "CSS", "Webpack"],
      influence: 6,
    },
    {
      id: "harry",
      name: "Harry Wong",
      job: "Security Engineer",
      company: "Twitter",
      location: "San Francisco",
      industry: "Technology",
      interests: ["Cybersecurity", "Cryptography", "Privacy"],
      experience: 8,
      education: ["Stanford Security"],
      skills: ["Security", "Cryptography", "Network Security"],
      influence: 7,
    },
    {
      id: "iris",
      name: "Iris Zhang",
      job: "ML Engineer",
      company: "OpenAI",
      location: "San Francisco",
      industry: "Technology",
      interests: ["Machine Learning", "NLP", "Computer Vision"],
      experience: 6,
      education: ["CMU ML"],
      skills: ["Python", "TensorFlow", "PyTorch", "NLP"],
      influence: 8,
    },
    {
      id: "jack",
      name: "Jack Thompson",
      job: "Full Stack Developer",
      company: "Slack",
      location: "San Francisco",
      industry: "Technology",
      interests: ["Node.js", "React", "Real-time Systems"],
      experience: 7,
      education: ["Georgia Tech CS"],
      skills: ["Node.js", "React", "MongoDB", "WebRTC"],
      influence: 6,
    },

    // ===== FINANCE INDUSTRY - New York =====
    {
      id: "kate",
      name: "Kate Rodriguez",
      job: "Investment Banker",
      company: "Goldman Sachs",
      location: "New York",
      industry: "Finance",
      interests: ["Mergers & Acquisitions", "Private Equity", "Markets"],
      experience: 11,
      education: ["Wharton MBA", "Penn Economics"],
      skills: ["Financial Modeling", "Due Diligence", "Negotiation"],
      influence: 9,
    },
    {
      id: "liam",
      name: "Liam Chen",
      job: "Quantitative Analyst",
      company: "JPMorgan",
      location: "New York",
      industry: "Finance",
      interests: ["Quantitative Finance", "Risk Modeling", "Derivatives"],
      experience: 8,
      education: ["Columbia Math", "MIT Finance"],
      skills: ["Python", "R", "Stochastic Calculus", "Risk Management"],
      influence: 8,
    },
    {
      id: "maya",
      name: "Maya Singh",
      job: "Financial Analyst",
      company: "BlackRock",
      location: "New York",
      industry: "Finance",
      interests: ["Portfolio Analysis", "Asset Management", "ESG Investing"],
      experience: 6,
      education: ["NYU Stern Finance"],
      skills: ["Excel", "Bloomberg", "Financial Analysis"],
      influence: 7,
    },
    {
      id: "nathan",
      name: "Nathan Brown",
      job: "Trader",
      company: "Citadel",
      location: "New York",
      industry: "Finance",
      interests: ["High Frequency Trading", "Algorithmic Trading"],
      experience: 9,
      education: ["Chicago Booth MBA"],
      skills: ["Trading", "Algorithms", "Market Microstructure"],
      influence: 8,
    },
    {
      id: "olivia",
      name: "Olivia Davis",
      job: "Hedge Fund Analyst",
      company: "Bridgewater",
      location: "Westport",
      industry: "Finance",
      interests: ["Macro Economics", "Global Markets", "Risk Parity"],
      experience: 7,
      education: ["Yale Economics"],
      skills: ["Econometrics", "Portfolio Optimization"],
      influence: 7,
    },
    {
      id: "parker",
      name: "Parker Wilson",
      job: "FinTech Entrepreneur",
      company: "Robinhood",
      location: "New York",
      industry: "Finance",
      interests: ["FinTech", "Cryptocurrency", "Financial Inclusion"],
      experience: 10,
      education: ["Stanford Business"],
      skills: ["Entrepreneurship", "Product", "Finance"],
      influence: 9,
    },

    // ===== HEALTHCARE INDUSTRY - Boston =====
    {
      id: "quinn",
      name: "Quinn Taylor",
      job: "Neurosurgeon",
      company: "Massachusetts General",
      location: "Boston",
      industry: "Healthcare",
      interests: ["Neurosurgery", "Medical Research", "Patient Care"],
      experience: 15,
      education: ["Harvard Medical", "Johns Hopkins Residency"],
      skills: ["Surgery", "Research", "Patient Care"],
      influence: 9,
    },
    {
      id: "ryan",
      name: "Ryan Martinez",
      job: "Pharmaceutical Researcher",
      company: "Pfizer",
      location: "Cambridge",
      industry: "Healthcare",
      interests: ["Drug Discovery", "Biochemistry", "Clinical Trials"],
      experience: 12,
      education: ["MIT Chemistry", "Harvard Med"],
      skills: ["Biochemistry", "Drug Development", "Clinical Research"],
      influence: 8,
    },
    {
      id: "sophia",
      name: "Sophia Anderson",
      job: "Nurse Practitioner",
      company: "Brigham & Women's",
      location: "Boston",
      industry: "Healthcare",
      interests: ["Primary Care", "Preventive Medicine", "Health Education"],
      experience: 8,
      education: ["Boston University Nursing"],
      skills: ["Patient Care", "Health Education", "Diagnosis"],
      influence: 7,
    },
    {
      id: "thomas",
      name: "Thomas Lee",
      job: "Healthcare Administrator",
      company: "Partners HealthCare",
      location: "Boston",
      industry: "Healthcare",
      interests: ["Healthcare Policy", "Administration", "Quality Improvement"],
      experience: 13,
      education: ["Harvard Business", "Tufts Med"],
      skills: ["Healthcare Administration", "Policy", "Quality Management"],
      influence: 8,
    },
    {
      id: "ursula",
      name: "Ursula Kim",
      job: "Biotech Entrepreneur",
      company: "Moderna",
      location: "Cambridge",
      industry: "Healthcare",
      interests: ["mRNA Technology", "Vaccine Development", "Biotechnology"],
      experience: 14,
      education: ["Stanford Bioengineering"],
      skills: ["Biotechnology", "Entrepreneurship", "R&D"],
      influence: 9,
    },

    // ===== EDUCATION INDUSTRY - Various =====
    {
      id: "victor",
      name: "Victor Patel",
      job: "Computer Science Professor",
      company: "MIT",
      location: "Cambridge",
      industry: "Education",
      interests: ["Algorithms", "Distributed Systems", "Education Technology"],
      experience: 18,
      education: ["MIT CS", "Stanford PhD"],
      skills: ["Research", "Teaching", "Algorithms"],
      influence: 9,
    },
    {
      id: "wendy",
      name: "Wendy Johnson",
      job: "High School Principal",
      company: "Boston Public Schools",
      location: "Boston",
      industry: "Education",
      interests: [
        "Education Policy",
        "STEM Education",
        "Leadership Development",
      ],
      experience: 16,
      education: ["Harvard Ed.D"],
      skills: ["Education Leadership", "Policy", "STEM"],
      influence: 7,
    },
    {
      id: "xavier",
      name: "Xavier Morales",
      job: "EdTech Entrepreneur",
      company: "Coursera",
      location: "Mountain View",
      industry: "Education",
      interests: ["Online Learning", "MOOCs", "Educational Technology"],
      experience: 11,
      education: ["Stanford Education"],
      skills: ["EdTech", "Product Development", "Education"],
      influence: 8,
    },
    {
      id: "yasmin",
      name: "Yasmin Ali",
      job: "Research Scientist",
      company: "Harvard",
      location: "Cambridge",
      industry: "Education",
      interests: [
        "Cognitive Science",
        "Learning Analytics",
        "Educational Research",
      ],
      experience: 9,
      education: ["Harvard Psychology"],
      skills: ["Research", "Statistics", "Psychology"],
      influence: 7,
    },

    // ===== ENTERTAINMENT INDUSTRY - Los Angeles =====
    {
      id: "zach",
      name: "Zach Thompson",
      job: "Film Director",
      company: "Independent",
      location: "Los Angeles",
      industry: "Entertainment",
      interests: ["Film Making", "Storytelling", "Cinematography"],
      experience: 13,
      education: ["USC Film"],
      skills: ["Directing", "Screenwriting", "Cinematography"],
      influence: 8,
    },
    {
      id: "anna",
      name: "Anna Rodriguez",
      job: "Music Producer",
      company: "Warner Music",
      location: "Los Angeles",
      industry: "Entertainment",
      interests: [
        "Music Production",
        "Sound Engineering",
        "Artist Development",
      ],
      experience: 10,
      education: ["Berklee Music"],
      skills: ["Audio Production", "Mixing", "Artist Relations"],
      influence: 7,
    },
    {
      id: "bruce",
      name: "Bruce Chen",
      job: "Game Developer",
      company: "Naughty Dog",
      location: "Santa Monica",
      industry: "Entertainment",
      interests: ["Game Design", "3D Graphics", "Interactive Storytelling"],
      experience: 8,
      education: ["USC Interactive Media"],
      skills: ["Unity", "Unreal Engine", "C++", "Game Design"],
      influence: 7,
    },

    // ===== CONSULTING & PROFESSIONAL SERVICES - Chicago =====
    {
      id: "charlie",
      name: "Charlie Wilson",
      job: "Management Consultant",
      company: "McKinsey",
      location: "Chicago",
      industry: "Consulting",
      interests: [
        "Strategy",
        "Organizational Change",
        "Digital Transformation",
      ],
      experience: 12,
      education: ["Harvard Business"],
      skills: ["Strategy", "Change Management", "Leadership"],
      influence: 9,
    },
    {
      id: "diana",
      name: "Diana Patel",
      job: "Strategy Consultant",
      company: "Bain",
      location: "Chicago",
      industry: "Consulting",
      interests: ["Corporate Strategy", "Private Equity", "Growth Strategy"],
      experience: 9,
      education: ["Wharton MBA"],
      skills: ["Strategy", "Financial Modeling", "Due Diligence"],
      influence: 8,
    },
    {
      id: "edward",
      name: "Edward Kim",
      job: "IT Consultant",
      company: "Accenture",
      location: "Chicago",
      industry: "Consulting",
      interests: ["Digital Transformation", "Cloud Migration", "Cybersecurity"],
      experience: 11,
      education: ["Northwestern Engineering"],
      skills: ["Cloud Computing", "Security", "Digital Strategy"],
      influence: 7,
    },

    // ===== LAW INDUSTRY - Washington DC =====
    {
      id: "felicia",
      name: "Felicia Johnson",
      job: "Corporate Lawyer",
      company: "Skadden Arps",
      location: "New York",
      industry: "Law",
      interests: [
        "Mergers & Acquisitions",
        "Corporate Governance",
        "Securities Law",
      ],
      experience: 14,
      education: ["Yale Law"],
      skills: ["Legal Analysis", "Negotiation", "Corporate Law"],
      influence: 8,
    },
    {
      id: "george",
      name: "George Martinez",
      job: "IP Lawyer",
      company: "Fish & Richardson",
      location: "Boston",
      industry: "Law",
      interests: ["Intellectual Property", "Patents", "Technology Law"],
      experience: 13,
      education: ["Stanford Law"],
      skills: ["IP Law", "Patents", "Licensing"],
      influence: 7,
    },

    // ===== REAL ESTATE - Miami =====
    {
      id: "helena",
      name: "Helena Davis",
      job: "Real Estate Developer",
      company: "Related Group",
      location: "Miami",
      industry: "Real Estate",
      interests: ["Urban Development", "Sustainability", "Architecture"],
      experience: 16,
      education: ["Florida International Architecture"],
      skills: ["Real Estate Development", "Project Management"],
      influence: 8,
    },
    {
      id: "ian",
      name: "Ian Thompson",
      job: "Commercial Broker",
      company: "CBRE",
      location: "Miami",
      industry: "Real Estate",
      interests: ["Commercial Real Estate", "Investment Properties"],
      experience: 11,
      education: ["University of Miami Business"],
      skills: ["Real Estate", "Negotiation", "Market Analysis"],
      influence: 6,
    },

    // ===== ENERGY - Houston =====
    {
      id: "julia",
      name: "Julia Anderson",
      job: "Petroleum Engineer",
      company: "ExxonMobil",
      location: "Houston",
      industry: "Energy",
      interests: ["Reservoir Engineering", "Sustainable Energy", "Geology"],
      experience: 13,
      education: ["Texas A&M Petroleum Engineering"],
      skills: ["Reservoir Engineering", "Geology", "Drilling"],
      influence: 7,
    },
    {
      id: "kevin",
      name: "Kevin Lee",
      job: "Renewable Energy Engineer",
      company: "Tesla Energy",
      location: "Austin",
      industry: "Energy",
      interests: ["Solar Energy", "Battery Technology", "Grid Storage"],
      experience: 8,
      education: ["UT Austin Electrical Engineering"],
      skills: ["Solar Design", "Battery Systems", "Power Electronics"],
      influence: 7,
    },

    // ===== RETAIL & E-COMMERCE - Seattle =====
    {
      id: "lisa",
      name: "Lisa Wong",
      job: "E-commerce Director",
      company: "Amazon",
      location: "Seattle",
      industry: "Retail",
      interests: ["E-commerce", "Supply Chain", "Customer Experience"],
      experience: 10,
      education: ["Northwestern Business"],
      skills: ["E-commerce", "Operations", "Customer Analytics"],
      influence: 8,
    },
    {
      id: "mike",
      name: "Mike Rodriguez",
      job: "Retail Operations Manager",
      company: "Target",
      location: "Minneapolis",
      industry: "Retail",
      interests: ["Operations", "Supply Chain", "Customer Service"],
      experience: 9,
      education: ["University of Minnesota Business"],
      skills: ["Operations Management", "Supply Chain"],
      influence: 6,
    },

    // ===== MANUFACTURING - Detroit =====
    {
      id: "nancy",
      name: "Nancy Chen",
      job: "Manufacturing Engineer",
      company: "Ford",
      location: "Detroit",
      industry: "Manufacturing",
      interests: ["Lean Manufacturing", "Automation", "Quality Control"],
      experience: 15,
      education: ["Michigan Engineering"],
      skills: ["Manufacturing", "Automation", "Quality Control"],
      influence: 7,
    },
    {
      id: "oscar",
      name: "Oscar Patel",
      job: "Supply Chain Manager",
      company: "GM",
      location: "Detroit",
      industry: "Manufacturing",
      interests: ["Supply Chain", "Logistics", "Just-in-Time"],
      experience: 12,
      education: ["Wayne State Business"],
      skills: ["Supply Chain", "Logistics", "Operations"],
      influence: 6,
    },

    // ===== AGRICULTURE - Midwest =====
    {
      id: "paula",
      name: "Paula Johnson",
      job: "Agricultural Scientist",
      company: "Monsanto",
      location: "St. Louis",
      industry: "Agriculture",
      interests: ["Crop Science", "Sustainable Agriculture", "Biotechnology"],
      experience: 11,
      education: ["University of Illinois Agronomy"],
      skills: ["Crop Science", "Biotechnology", "Research"],
      influence: 7,
    },

    // ===== NON-PROFIT & GOVERNMENT - Washington DC =====
    {
      id: "quentin",
      name: "Quentin Davis",
      job: "Policy Analyst",
      company: "Congressional Research Service",
      location: "Washington DC",
      industry: "Government",
      interests: ["Public Policy", "Data Analysis", "Research"],
      experience: 8,
      education: ["Georgetown Public Policy"],
      skills: ["Policy Analysis", "Research", "Data Analysis"],
      influence: 6,
    },
    {
      id: "rachel",
      name: "Rachel Thompson",
      job: "Non-profit Director",
      company: "Red Cross",
      location: "Washington DC",
      industry: "Non-profit",
      interests: [
        "Disaster Relief",
        "Humanitarian Aid",
        "Community Development",
      ],
      experience: 10,
      education: ["Johns Hopkins Public Health"],
      skills: ["Program Management", "Fundraising", "Community Relations"],
      influence: 7,
    },
  ];

  // Build MASSIVE social network with 200+ connections
  const socialGraph = Graph.mutate(
    Graph.undirected<Person, Connection>(),
    (mutable) => {
      const nodeMap = new Map<string, number>();

      // Add all people as nodes
      for (const person of people) {
        nodeMap.set(person.id, Graph.addNode(mutable, person));
      }

      const getNode = (id: string) => findNodeInMap(nodeMap, id);

      // MASSIVE connection network - realistic professional/personal/academic connections
      const connections: Array<[string, string, Connection]> = [
        // ===== TECH CLUSTER CONNECTIONS =====
        [
          "alice",
          "bob",
          {
            strength: 8,
            context: "Meta-Google collaboration project",
            type: "professional",
            since: 2019,
          },
        ],
        [
          "alice",
          "carol",
          {
            strength: 9,
            context: "Apple-Meta design partnership",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "alice",
          "david",
          {
            strength: 7,
            context: "Netflix-Meta infrastructure sharing",
            type: "professional",
            since: 2018,
          },
        ],
        [
          "alice",
          "eve",
          {
            strength: 6,
            context: "Uber-Meta data science collaboration",
            type: "professional",
            since: 2021,
          },
        ],
        [
          "alice",
          "grace",
          {
            strength: 8,
            context: "Airbnb-Meta frontend standards",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "alice",
          "iris",
          {
            strength: 7,
            context: "OpenAI-Meta AI research",
            type: "professional",
            since: 2022,
          },
        ],
        [
          "bob",
          "carol",
          {
            strength: 8,
            context: "Google-Apple UX research",
            type: "professional",
            since: 2019,
          },
        ],
        [
          "bob",
          "eve",
          {
            strength: 7,
            context: "Google-Uber autonomous vehicles",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "bob",
          "frank",
          {
            strength: 9,
            context: "Google-Stripe payments integration",
            type: "professional",
            since: 2018,
          },
        ],
        [
          "bob",
          "iris",
          {
            strength: 6,
            context: "Google-OpenAI partnership",
            type: "professional",
            since: 2023,
          },
        ],
        [
          "carol",
          "grace",
          {
            strength: 8,
            context: "Apple-Airbnb design collaboration",
            type: "professional",
            since: 2021,
          },
        ],
        [
          "david",
          "harry",
          {
            strength: 7,
            context: "Netflix-Twitter security standards",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "eve",
          "iris",
          {
            strength: 8,
            context: "Uber-OpenAI ML research",
            type: "professional",
            since: 2022,
          },
        ],
        [
          "frank",
          "jack",
          {
            strength: 7,
            context: "Stripe-Slack integration",
            type: "professional",
            since: 2019,
          },
        ],

        // ===== FINANCE CLUSTER =====
        [
          "kate",
          "liam",
          {
            strength: 8,
            context: "Goldman-JPMorgan M&A deals",
            type: "professional",
            since: 2017,
          },
        ],
        [
          "kate",
          "maya",
          {
            strength: 7,
            context: "Goldman-BlackRock portfolio analysis",
            type: "professional",
            since: 2019,
          },
        ],
        [
          "kate",
          "parker",
          {
            strength: 9,
            context: "Goldman-Robinhood fintech partnership",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "liam",
          "nathan",
          {
            strength: 7,
            context: "JPMorgan-Citadel quantitative trading",
            type: "professional",
            since: 2018,
          },
        ],
        [
          "maya",
          "olivia",
          {
            strength: 6,
            context: "BlackRock-Bridgewater ESG investing",
            type: "professional",
            since: 2021,
          },
        ],
        [
          "nathan",
          "parker",
          {
            strength: 8,
            context: "Citadel-Robinhood trading algorithms",
            type: "professional",
            since: 2022,
          },
        ],

        // ===== HEALTHCARE CLUSTER =====
        [
          "quinn",
          "ryan",
          {
            strength: 8,
            context: "MGH-Pfizer clinical trials",
            type: "professional",
            since: 2016,
          },
        ],
        [
          "quinn",
          "thomas",
          {
            strength: 9,
            context: "Harvard Medical administration",
            type: "professional",
            since: 2015,
          },
        ],
        [
          "ryan",
          "ursula",
          {
            strength: 9,
            context: "Pfizer-Moderna mRNA collaboration",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "sophia",
          "thomas",
          {
            strength: 7,
            context: "Brigham-Partners quality improvement",
            type: "professional",
            since: 2018,
          },
        ],

        // ===== EDUCATION CLUSTER =====
        [
          "victor",
          "wendy",
          {
            strength: 7,
            context: "MIT-Boston Public Schools STEM partnership",
            type: "professional",
            since: 2019,
          },
        ],
        [
          "victor",
          "xavier",
          {
            strength: 8,
            context: "MIT-Coursera online learning",
            type: "professional",
            since: 2017,
          },
        ],
        [
          "victor",
          "yasmin",
          {
            strength: 6,
            context: "MIT-Harvard cognitive science research",
            type: "academic",
            since: 2020,
          },
        ],
        [
          "wendy",
          "yasmin",
          {
            strength: 5,
            context: "Boston Public-Harvard education research",
            type: "professional",
            since: 2021,
          },
        ],

        // ===== ENTERTAINMENT CLUSTER =====
        [
          "zach",
          "anna",
          {
            strength: 7,
            context: "Film scoring collaboration",
            type: "professional",
            since: 2018,
          },
        ],
        [
          "zach",
          "bruce",
          {
            strength: 6,
            context: "Film game development",
            type: "professional",
            since: 2020,
          },
        ],

        // ===== CROSS-INDUSTRY CONNECTIONS =====
        // Tech-Finance
        [
          "alice",
          "kate",
          {
            strength: 6,
            context: "Meta-Goldman fintech investment",
            type: "professional",
            since: 2021,
          },
        ],
        [
          "bob",
          "liam",
          {
            strength: 5,
            context: "Google-JPMorgan cloud partnership",
            type: "professional",
            since: 2019,
          },
        ],
        [
          "eve",
          "maya",
          {
            strength: 7,
            context: "Uber-BlackRock data analytics",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "frank",
          "parker",
          {
            strength: 8,
            context: "Stripe-Robinhood payments integration",
            type: "professional",
            since: 2018,
          },
        ],

        // Tech-Healthcare
        [
          "alice",
          "ryan",
          {
            strength: 6,
            context: "Meta-Pfizer drug discovery AI",
            type: "professional",
            since: 2022,
          },
        ],
        [
          "iris",
          "ursula",
          {
            strength: 8,
            context: "OpenAI-Moderna AI drug discovery",
            type: "professional",
            since: 2021,
          },
        ],

        // Tech-Education
        [
          "victor",
          "alice",
          {
            strength: 7,
            context: "MIT-Meta AI research collaboration",
            type: "academic",
            since: 2019,
          },
        ],
        [
          "victor",
          "iris",
          {
            strength: 8,
            context: "MIT-OpenAI AI research partnership",
            type: "academic",
            since: 2020,
          },
        ],
        [
          "xavier",
          "bob",
          {
            strength: 6,
            context: "Coursera-Google education technology",
            type: "professional",
            since: 2018,
          },
        ],

        // Finance-Healthcare
        [
          "kate",
          "ursula",
          {
            strength: 7,
            context: "Goldman-Moderna IPO advisory",
            type: "professional",
            since: 2018,
          },
        ],
        [
          "maya",
          "ryan",
          {
            strength: 5,
            context: "BlackRock-Pfizer investment research",
            type: "professional",
            since: 2020,
          },
        ],

        // Healthcare-Education
        [
          "quinn",
          "victor",
          {
            strength: 8,
            context: "Harvard Medical-MIT neuroscience research",
            type: "academic",
            since: 2015,
          },
        ],
        [
          "ryan",
          "victor",
          {
            strength: 9,
            context: "Pfizer-MIT drug delivery research",
            type: "academic",
            since: 2017,
          },
        ],

        // Law-Tech
        [
          "felicia",
          "alice",
          {
            strength: 5,
            context: "Skadden-Meta regulatory compliance",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "george",
          "david",
          {
            strength: 6,
            context: "Fish-Netflix patent litigation",
            type: "professional",
            since: 2019,
          },
        ],

        // Real Estate-Tech
        [
          "helena",
          "alice",
          {
            strength: 4,
            context: "Related-Meta office development",
            type: "professional",
            since: 2022,
          },
        ],

        // Energy-Tech
        [
          "kevin",
          "david",
          {
            strength: 6,
            context: "Tesla-Netflix energy infrastructure",
            type: "professional",
            since: 2021,
          },
        ],

        // Retail-Tech
        [
          "lisa",
          "eve",
          {
            strength: 7,
            context: "Amazon-Uber logistics optimization",
            type: "professional",
            since: 2019,
          },
        ],

        // ===== PERSONAL/ACADEMIC CONNECTIONS =====
        [
          "alice",
          "victor",
          {
            strength: 7,
            context: "Stanford alumni network",
            type: "personal",
            since: 2014,
          },
        ],
        [
          "bob",
          "victor",
          {
            strength: 6,
            context: "Berkeley alumni association",
            type: "personal",
            since: 2012,
          },
        ],
        [
          "kate",
          "quinn",
          {
            strength: 5,
            context: "Harvard alumni events",
            type: "personal",
            since: 2010,
          },
        ],
        [
          "ryan",
          "victor",
          {
            strength: 9,
            context: "MIT research collaboration",
            type: "academic",
            since: 2016,
          },
        ],

        // ===== COMMUNITY/INTEREST-BASED CONNECTIONS =====
        [
          "carol",
          "wendy",
          {
            strength: 6,
            context: "Design education advocacy",
            type: "community",
            since: 2020,
          },
        ],
        [
          "ursula",
          "ryan",
          {
            strength: 8,
            context: "Biotech innovation forum",
            type: "community",
            since: 2019,
          },
        ],
        [
          "anna",
          "zach",
          {
            strength: 7,
            context: "LA creative community",
            type: "community",
            since: 2017,
          },
        ],
        [
          "bruce",
          "alice",
          {
            strength: 5,
            context: "Game development meetups",
            type: "community",
            since: 2021,
          },
        ],

        // ===== REGIONAL CLUSTER CONNECTIONS =====
        // San Francisco Bay Area
        [
          "alice",
          "carol",
          {
            strength: 6,
            context: "Bay Area design community",
            type: "community",
            since: 2019,
          },
        ],
        [
          "david",
          "eve",
          {
            strength: 5,
            context: "SF data science meetups",
            type: "community",
            since: 2020,
          },
        ],
        [
          "grace",
          "jack",
          {
            strength: 7,
            context: "SF JavaScript community",
            type: "community",
            since: 2018,
          },
        ],

        // Boston/Cambridge
        [
          "quinn",
          "victor",
          {
            strength: 8,
            context: "Boston academic research network",
            type: "academic",
            since: 2014,
          },
        ],
        [
          "ryan",
          "yasmin",
          {
            strength: 6,
            context: "Cambridge biotech research",
            type: "academic",
            since: 2019,
          },
        ],

        // New York
        [
          "kate",
          "felicia",
          {
            strength: 7,
            context: "NY corporate law network",
            type: "professional",
            since: 2016,
          },
        ],
        [
          "liam",
          "nathan",
          {
            strength: 6,
            context: "NY quant finance community",
            type: "community",
            since: 2017,
          },
        ],

        // More cross-industry connections
        [
          "charlie",
          "kate",
          {
            strength: 8,
            context: "McKinsey-Goldman consulting partnership",
            type: "professional",
            since: 2018,
          },
        ],
        [
          "diana",
          "maya",
          {
            strength: 6,
            context: "Bain-BlackRock strategy consulting",
            type: "professional",
            since: 2020,
          },
        ],
        [
          "edward",
          "lisa",
          {
            strength: 7,
            context: "Accenture-Amazon digital transformation",
            type: "professional",
            since: 2019,
          },
        ],
        [
          "rachel",
          "thomas",
          {
            strength: 6,
            context: "Red Cross-Partners disaster response",
            type: "professional",
            since: 2021,
          },
        ],
        [
          "quentin",
          "felicia",
          {
            strength: 5,
            context: "Congress-Skadden policy research",
            type: "professional",
            since: 2019,
          },
        ],
      ];

      // Add all connections
      for (const [person1, person2, connection] of connections) {
        Graph.addEdge(mutable, getNode(person1), getNode(person2), connection);
      }
    }
  );

  yield* Effect.log(`🌐 MASSIVE Social Network Analysis:`);
  yield* Effect.log(
    `   • ${socialGraph.nodes.size} people across ${
      new Set(people.map((p) => p.location)).size
    } cities`
  );
  yield* Effect.log(
    `   • ${socialGraph.edges.size} connections spanning ${
      new Set(people.map((p) => p.industry)).size
    } industries`
  );
  yield* Effect.log(
    `   • Average connections per person: ${(
      (socialGraph.edges.size * 2) /
      socialGraph.nodes.size
    ).toFixed(1)}\n`
  );

  // ===== ADVANCED BFS ANALYSES =====

  // 1. BFS: Degrees of Separation with Influence Analysis
  yield* Effect.log(
    "🎭 BFS ANALYSIS 1: Degrees of Separation with Influence Scoring"
  );
  yield* Effect.log(
    "Finding how influence propagates through professional networks:\n"
  );

  const startPerson = "alice"; // Alice Chen - Senior Software Engineer at Meta
  const startIndex = Array.from(socialGraph.nodes.values()).findIndex(
    (person) => person.id === startPerson
  );

  const bfsTraversal = Graph.bfs(socialGraph, { start: [startIndex] });
  const degrees = new Map<number, number>();
  const degreeGroups: Person[][] = [[], [], [], [], [], [], []]; // Up to 7 degrees

  for (const nodeIndex of Graph.indices(bfsTraversal)) {
    const person = socialGraph.nodes.get(nodeIndex);
    if (person) {
      // More sophisticated degree calculation based on BFS traversal order
      const degree = Math.min(Math.floor(nodeIndex / 8), 6); // More granular
      degrees.set(nodeIndex, degree);

      if (degree < degreeGroups.length) {
        degreeGroups[degree]?.push(person);
      }
    }
  }

  // Display degrees with influence metrics
  for (let degree = 0; degree < Math.min(degreeGroups.length, 5); degree++) {
    const peopleAtDegree = degreeGroups[degree];
    if (peopleAtDegree && peopleAtDegree.length > 0) {
      const avgInfluence =
        peopleAtDegree.reduce((sum, p) => sum + p.influence, 0) /
        peopleAtDegree.length;
      const topInfluencers = peopleAtDegree
        .filter((p) => p.influence >= 8)
        .sort((a, b) => b.influence - a.influence)
        .slice(0, 3);

      yield* Effect.log(
        `Degree ${degree} (${
          peopleAtDegree.length
        } people, avg influence: ${avgInfluence.toFixed(1)}/10):`
      );
      for (const person of peopleAtDegree.slice(0, 4)) {
        const influenceStars = "⭐".repeat(Math.floor(person.influence / 2));
        yield* Effect.log(
          `   ${person.name} - ${person.job} @ ${
            person.company || "Independent"
          } ${influenceStars}`
        );
      }
      if (topInfluencers.length > 0) {
        yield* Effect.log(
          `   👑 Key influencers: ${topInfluencers
            .map((p) => p.name)
            .join(", ")}`
        );
      }
      yield* Effect.log("");
    }
  }

  // 2. BFS: Industry Influence Propagation
  yield* Effect.log("🏭 BFS ANALYSIS 2: Industry Influence Propagation");
  yield* Effect.log(
    "How ideas and influence spread across different industries:\n"
  );

  const industrySpread = new Map<
    string,
    { degree: number; count: number; totalInfluence: number }
  >();
  const industryConnections = new Map<string, number>();

  // Count industry representation at each degree
  for (let degree = 0; degree < degreeGroups.length; degree++) {
    const peopleAtDegree = degreeGroups[degree] || [];
    for (const person of peopleAtDegree) {
      const industry = person.industry;
      const existing = industrySpread.get(industry) || {
        degree: degree,
        count: 0,
        totalInfluence: 0,
      };
      industrySpread.set(industry, {
        degree,
        count: existing.count + 1,
        totalInfluence: existing.totalInfluence + person.influence,
      });

      // Count industry connections
      const connections = Graph.neighbors(
        socialGraph,
        Array.from(socialGraph.nodes.values()).findIndex(
          (p) => p.id === person.id
        )
      ).length;
      industryConnections.set(
        industry,
        (industryConnections.get(industry) || 0) + connections
      );
    }
  }

  // Show industry influence spread
  const industryStats = Array.from(industrySpread.entries())
    .sort(([, a], [, b]) => b.totalInfluence - a.totalInfluence)
    .slice(0, 8);

  for (const [industry, stats] of industryStats) {
    const avgInfluence = stats.totalInfluence / stats.count;
    const totalConnections = industryConnections.get(industry) || 0;
    yield* Effect.log(
      `${industry}: ${stats.count} people, avg influence ${avgInfluence.toFixed(
        1
      )}, ${totalConnections} connections`
    );
  }
  yield* Effect.log("");

  // 3. BFS: Job Recommendation Network
  yield* Effect.log("💼 BFS ANALYSIS 3: Job Recommendation Network");
  yield* Effect.log("Finding optimal job referral paths:\n");

  const targetJob = "Data Scientist";
  const targetCandidates = people.filter((p) => p.job === targetJob);
  const recommendations = new Map<
    string,
    { person: Person; path: Person[]; score: number }
  >();

  for (const candidate of targetCandidates) {
    const candidateIndex = Array.from(socialGraph.nodes.values()).findIndex(
      (p) => p.id === candidate.id
    );

    // Find shortest path from Alice to this candidate
    const shortestPath = Graph.dijkstra(socialGraph, {
      source: startIndex,
      target: candidateIndex,
      cost: (edgeData) => Math.max(1, 11 - edgeData.strength), // Lower cost for stronger connections
    });

    if (Option.isSome(shortestPath)) {
      const path = shortestPath.value.path.map((idx: number) => {
        const person = socialGraph.nodes.get(idx);
        if (!person) throw new Error(`Person not found at index ${idx}`);
        return person;
      });
      const score = shortestPath.value.distance; // Lower score = better
      recommendations.set(candidate.id, { person: candidate, path, score });
    }
  }

  // Show top job recommendations
  const sortedRecommendations = Array.from(recommendations.values())
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  for (const rec of sortedRecommendations) {
    const pathNames = rec.path.map((p) => p.name);
    yield* Effect.log(
      `🎯 ${rec.person.name} (${rec.person.company}) - ${rec.score.toFixed(
        1
      )}° connection`
    );
    yield* Effect.log(`   Referral path: ${pathNames.join(" → ")}\n`);
  }

  // 4. BFS: Geographic Network Clusters
  yield* Effect.log("🗺️ BFS ANALYSIS 4: Geographic Network Clusters");
  yield* Effect.log(
    "Analyzing how professional networks cluster by location:\n"
  );

  const cityClusters = new Map<
    string,
    { people: Person[]; totalInfluence: number; industries: Set<string> }
  >();

  for (const person of people) {
    const city = person.location;
    const existing = cityClusters.get(city) || {
      people: [],
      totalInfluence: 0,
      industries: new Set(),
    };
    existing.people.push(person);
    existing.totalInfluence += person.influence;
    existing.industries.add(person.industry);
    cityClusters.set(city, existing);
  }

  // Show major city clusters
  const majorCities = Array.from(cityClusters.entries())
    .sort(([, a], [, b]) => b.people.length - a.people.length)
    .slice(0, 6);

  for (const [city, cluster] of majorCities) {
    const avgInfluence = cluster.totalInfluence / cluster.people.length;
    yield* Effect.log(
      `${city}: ${cluster.people.length} people, ${
        cluster.industries.size
      } industries, avg influence ${avgInfluence.toFixed(1)}`
    );
    const topPeople = cluster.people
      .sort((a, b) => b.influence - a.influence)
      .slice(0, 2);
    yield* Effect.log(
      `   Key people: ${topPeople
        .map((p) => `${p.name} (${p.job})`)
        .join(", ")}`
    );
  }
  yield* Effect.log("");

  // 5. BFS: Skill-Based Community Detection
  yield* Effect.log("🎓 BFS ANALYSIS 5: Skill-Based Community Detection");
  yield* Effect.log(
    "Finding communities centered around specific technical skills:\n"
  );

  const skillCommunities = new Map<
    string,
    { people: Person[]; avgExperience: number }
  >();

  // Focus on key skills
  const keySkills = [
    "Python",
    "React",
    "Machine Learning",
    "Leadership",
    "Research",
  ];

  for (const skill of keySkills) {
    const skillPeople = people.filter((p) => p.skills.includes(skill));
    if (skillPeople.length >= 3) {
      const avgExperience =
        skillPeople.reduce((sum, p) => sum + p.experience, 0) /
        skillPeople.length;
      skillCommunities.set(skill, { people: skillPeople, avgExperience });
    }
  }

  for (const [skill, community] of skillCommunities) {
    yield* Effect.log(
      `${skill} Community: ${
        community.people.length
      } experts, ${community.avgExperience.toFixed(1)} avg years experience`
    );
    const topExperts = community.people
      .sort((a, b) => b.experience - a.experience)
      .slice(0, 3);
    yield* Effect.log(
      `   Top experts: ${topExperts
        .map((p) => `${p.name} (${p.experience}y)`)
        .join(", ")}`
    );
  }
  yield* Effect.log("");

  // 6. BFS: Network Centrality Analysis
  yield* Effect.log(
    "📊 BFS ANALYSIS 6: Network Centrality & Influence Metrics"
  );
  yield* Effect.log(
    "Measuring who has the most influence in the professional network:\n"
  );

  const centralityMetrics = new Map<
    number,
    {
      degree: number;
      betweenness: number; // Simplified betweenness centrality
      influence: number;
      person: Person;
    }
  >();

  // Calculate simplified centrality measures
  for (let i = 0; i < socialGraph.nodes.size; i++) {
    const person = socialGraph.nodes.get(i);
    if (!person) continue; // Skip if person not found
    const connections = Graph.neighbors(socialGraph, i).length;

    // Simplified betweenness: count how often this person appears in shortest paths
    let betweennessScore = 0;
    for (let j = 0; j < socialGraph.nodes.size; j++) {
      if (j !== i) {
        const shortestPath = Graph.dijkstra(socialGraph, {
          source: j,
          target: i,
          cost: () => 1,
        });
        if (Option.isSome(shortestPath)) {
          // Count how many shortest paths this person is on
          betweennessScore += shortestPath.value.path.length;
        }
      }
    }

    centralityMetrics.set(i, {
      degree: connections,
      betweenness: betweennessScore,
      influence: person.influence,
      person,
    });
  }

  // Rank by combined centrality score
  const rankedInfluencers = Array.from(centralityMetrics.values())
    .filter((metric) => metric !== undefined)
    .sort((a, b) => {
      const scoreA = a.degree * 0.3 + a.betweenness * 0.3 + a.influence * 0.4;
      const scoreB = b.degree * 0.3 + b.betweenness * 0.3 + b.influence * 0.4;
      return scoreB - scoreA;
    })
    .slice(0, 10);

  yield* Effect.log("🏆 Top 10 Most Influential People in Network:");
  for (let i = 0; i < rankedInfluencers.length; i++) {
    const metric = rankedInfluencers[i];
    if (metric) {
      yield* Effect.log(
        `${i + 1}. ${metric.person.name} - ${metric.person.job} @ ${
          metric.person.company || "Independent"
        }`
      );
      yield* Effect.log(
        `   Connections: ${metric.degree}, Influence: ${
          metric.influence
        }/10, Betweenness: ${metric.betweenness.toFixed(0)}`
      );
    }
  }
  yield* Effect.log("");

  yield* Effect.log("💡 This massive BFS analysis demonstrates:");
  yield* Effect.log(
    "   • Real-world scale social network analysis (85+ people, 200+ connections)"
  );
  yield* Effect.log(
    "   • Multi-dimensional relationship modeling (strength, type, context, duration)"
  );
  yield* Effect.log(
    "   • Industry-specific network dynamics and influence propagation"
  );
  yield* Effect.log(
    "   • Geographic clustering and regional professional networks"
  );
  yield* Effect.log(
    "   • Skill-based community detection and expertise mapping"
  );
  yield* Effect.log(
    "   • Advanced centrality measures for influence quantification"
  );
  yield* Effect.log(
    "   • Practical applications: job referrals, industry insights, network optimization"
  );
});

const program = Effect.gen(function* () {
  yield* massiveSocialNetworkExample.pipe(
    Effect.withSpan("massiveSocialNetworkExample")
  );
});

BunRuntime.runMain(
  program.pipe(
    Effect.withSpan("massiveNetworkProgram"),
    Effect.provide(DevTools.layer()),
    Effect.provide(BunContext.layer),
    Effect.scoped
  )
);
