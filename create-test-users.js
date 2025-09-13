const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testUsers = [
  {
    name: "alexandra_tech",
    email: "alexandra.tech@example.com",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    role: "CORE_CONTRIBUTOR",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    status: "AVAILABLE",
    reputation: 1250,
    fullname: "Alexandra Rodriguez",
    skills: "React, TypeScript, Solidity, DeFi",
    country: "Spain",
    languages: "English, Spanish, Catalan",
    professionalProfile: {
      tagline: "Full-Stack Developer & DeFi Enthusiast",
      bio: "Passionate about blockchain technology and decentralized finance. 5+ years building scalable web applications.",
      experience: "Senior Developer at CryptoCorp, previously at TechStart",
      linkCv: "https://drive.google.com/alexandra-rodriguez-cv"
    },
    socialLinks: {
      github: "https://github.com/alexandra-tech",
      linkedin: "https://linkedin.com/in/alexandra-rodriguez",
      x: "https://x.com/alexandra_tech",
      facebook: "https://facebook.com/alexandra.rodriguez"
    }
  },
  {
    name: "marcus_ai",
    email: "marcus.ai@example.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "ADMIN",
    walletAddress: "0x8ba1f109551bA432bdfE5c6c65369D9c9aF0aB13",
    status: "BUSY",
    reputation: 2100,
    fullname: "Marcus Chen",
    skills: "Machine Learning, Python, TensorFlow, AI Governance",
    country: "Singapore",
    languages: "English, Mandarin, Cantonese",
    professionalProfile: {
      tagline: "AI Research Lead & Governance Specialist",
      bio: "Leading AI research initiatives with focus on ethical AI and governance frameworks. PhD in Computer Science from MIT.",
      experience: "AI Research Lead at SingularityNET, previously at Google AI",
      linkCv: "https://drive.google.com/marcus-chen-cv"
    },
    socialLinks: {
      github: "https://github.com/marcus-ai",
      linkedin: "https://linkedin.com/in/marcus-chen-ai",
      x: "https://x.com/marcus_ai_research"
    }
  },
  {
    name: "sophia_web3",
    email: "sophia.web3@example.com",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    role: "CORE_CONTRIBUTOR",
    walletAddress: "0x1234567890123456789012345678901234567890",
    status: "AVAILABLE",
    reputation: 890,
    fullname: "Sophia Williams",
    skills: "Web3, Ethereum, Smart Contracts, UX/UI Design",
    country: "United States",
    languages: "English, French",
    professionalProfile: {
      tagline: "Web3 Developer & UX Designer",
      bio: "Creating intuitive user experiences for decentralized applications. Passionate about making blockchain accessible to everyone.",
      experience: "Lead Designer at Web3Studio, previously at Meta",
      linkCv: "https://drive.google.com/sophia-williams-cv"
    },
    socialLinks: {
      github: "https://github.com/sophia-web3",
      linkedin: "https://linkedin.com/in/sophia-williams-web3",
      x: "https://x.com/sophia_web3",
      facebook: "https://facebook.com/sophia.williams"
    }
  },
  {
    name: "david_consensus",
    email: "david.consensus@example.com",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "CORE_CONTRIBUTOR",
    walletAddress: "0x9876543210987654321098765432109876543210",
    status: "VERY_BUSY",
    reputation: 1560,
    fullname: "David Kim",
    skills: "Consensus Mechanisms, Cryptography, Rust, Go",
    country: "South Korea",
    languages: "English, Korean, Japanese",
    professionalProfile: {
      tagline: "Blockchain Protocol Engineer",
      bio: "Specializing in consensus mechanisms and cryptographic protocols. Building the future of decentralized systems.",
      experience: "Protocol Engineer at ConsensusLabs, previously at Binance",
      linkCv: "https://drive.google.com/david-kim-cv"
    },
    socialLinks: {
      github: "https://github.com/david-consensus",
      linkedin: "https://linkedin.com/in/david-kim-consensus",
      x: "https://x.com/david_consensus"
    }
  },
  {
    name: "elena_governance",
    email: "elena.governance@example.com",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    role: "ADMIN",
    walletAddress: "0x5555555555555555555555555555555555555555",
    status: "AVAILABLE",
    reputation: 1780,
    fullname: "Elena Petrova",
    skills: "Governance Systems, DAO Management, Legal Tech, Russian",
    country: "Russia",
    languages: "English, Russian, German",
    professionalProfile: {
      tagline: "Governance & Legal Tech Expert",
      bio: "Expert in decentralized governance systems and legal technology. Advising DAOs and blockchain projects on compliance and governance.",
      experience: "Governance Advisor at DAO Legal, previously at ConsenSys",
      linkCv: "https://drive.google.com/elena-petrova-cv"
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/elena-petrova-governance",
      x: "https://x.com/elena_governance",
      github: "https://github.com/elena-governance"
    }
  }
];

async function createTestUsers() {
  try {
    console.log('🚀 Starting to create test users...');
    
    for (const userData of testUsers) {
      console.log(`\n📝 Creating user: ${userData.name}`);
      
      // Extract profile and social data
      const { professionalProfile, socialLinks, ...userFields } = userData;
      
      // Create user with profile and social links
      const user = await prisma.user.create({
        data: {
          ...userFields,
          professionalProfile: {
            create: professionalProfile
          },
          socialLinks: {
            create: socialLinks
          }
        },
        include: {
          professionalProfile: true,
          socialLinks: true
        }
      });
      
      console.log(`✅ Created user: ${user.name} (${user.id})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Reputation: ${user.reputation}`);
      console.log(`   Skills: ${user.skills}`);
    }
    
    console.log('\n🎉 All test users created successfully!');
    
    // Verify the users were created
    const totalUsers = await prisma.user.count();
    const usersWithProfiles = await prisma.user.findMany({
      include: {
        professionalProfile: true,
        socialLinks: true
      }
    });
    
    console.log(`\n📊 Database Summary:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with profiles: ${usersWithProfiles.filter(u => u.professionalProfile).length}`);
    console.log(`   Users with social links: ${usersWithProfiles.filter(u => u.socialLinks).length}`);
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestUsers();
