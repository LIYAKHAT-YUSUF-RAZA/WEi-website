// Featured Courses and Internships Data from GitHub Demo

export const featuredCourses = [
  {
    _id: 'fc1',
    image: 'https://source.unsplash.com/400x300/?html,coding',
    title: 'HTML',
    description: 'Master the fundamentals of HTML and build beautiful, responsive websites from scratch.',
    category: 'Web Development',
    duration: '8 weeks',
    level: 'Beginner',
    price: 3999,
    originalPrice: 9999,
    discountPrice: 3999,
    discountPercentage: 60,
    instructorDetails: {
      name: 'LIYAKHAT'
    }
  },
  {
    _id: 'fc2',
    image: 'https://source.unsplash.com/400x300/?programming,javascript',
    title: 'MERN Stack',
    description: 'The MERN stack is a popular, open-source JavaScript stack for building modern web applications.',
    category: 'Web Development',
    duration: '8 weeks',
    level: 'Beginner',
    price: 9,
    originalPrice: 9999,
    discountPrice: 9,
    discountPercentage: 100,
    instructorDetails: {
      name: 'LIYAKHAT'
    }
  },
  {
    _id: 'fc3',
    image: 'https://source.unsplash.com/400x300/?algorithms,programming',
    title: 'DSA',
    description: 'DSA most commonly refers to Data Structures and Algorithms, the foundation of computer science.',
    category: 'Programming',
    duration: '8 weeks',
    level: 'Beginner',
    price: 7999,
    originalPrice: 9999,
    discountPrice: 7999,
    discountPercentage: 20,
    instructorDetails: {
      name: 'LIYAKHAT'
    }
  },
  {
    _id: 'fc4',
    image: 'https://source.unsplash.com/400x300/?python,code',
    title: 'Python Programming',
    description: 'Learn Python from basics to advanced concepts including data structures, OOP, and popular frameworks.',
    category: 'Programming',
    duration: '10 weeks',
    level: 'Beginner',
    price: 4999,
    originalPrice: 12999,
    discountPrice: 4999,
    discountPercentage: 62,
    instructorDetails: {
      name: 'LIYAKHAT'
    }
  },
  {
    _id: 'fc5',
    image: 'https://source.unsplash.com/400x300/?react,web-development',
    title: 'React.js Development',
    description: 'Build modern, interactive user interfaces with React. Learn hooks, context, and best practices.',
    category: 'Web Development',
    duration: '12 weeks',
    level: 'Intermediate',
    price: 5999,
    originalPrice: 14999,
    discountPrice: 5999,
    discountPercentage: 60,
    instructorDetails: {
      name: 'LIYAKHAT'
    }
  },
  {
    _id: 'fc6',
    image: 'https://source.unsplash.com/400x300/?fullstack,developer',
    title: 'Full Stack Development',
    description: 'Become a complete developer by mastering both frontend and backend technologies.',
    category: 'Web Development',
    duration: '16 weeks',
    level: 'Advanced',
    price: 9999,
    originalPrice: 24999,
    discountPrice: 9999,
    discountPercentage: 60,
    instructorDetails: {
      name: 'LIYAKHAT'
    }
  }
];

export const featuredInternships = [
  {
    _id: 'fi1',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
    title: 'Software Development Intern',
    description: 'Work on real projects with experienced developers. Learn modern frameworks and best practices.',
    type: 'Remote',
    duration: '3-6 months',
    stipend: '₹15,000 - ₹25,000/month',
    location: 'Remote',
    department: 'Engineering',
    openings: 5,
    applicants: 0
  },
  {
    _id: 'fi2',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop',
    title: 'Marketing Intern',
    description: 'Gain hands-on experience in digital marketing campaigns and strategy development.',
    type: 'Hybrid',
    duration: '3 months',
    stipend: '₹10,000 - ₹15,000/month',
    location: 'Bangalore/Remote',
    department: 'Marketing',
    openings: 3,
    applicants: 0
  },
  {
    _id: 'fi3',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    title: 'Data Analytics Intern',
    description: 'Analyze real business data and create actionable insights using modern tools.',
    type: 'On-site',
    duration: '6 months',
    stipend: '₹18,000 - ₹30,000/month',
    location: 'Hyderabad',
    department: 'Data Analytics',
    openings: 4,
    applicants: 0
  }
];

export const topPartners = [
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=100&fit=crop',
  'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=200&h=100&fit=crop',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop',
  'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=100&fit=crop'
];

export const freeServices = [
  {
    _id: 'fs1',
    role: 'Electrician',
    name: 'Rajesh Kumar',
    image: 'https://images.unsplash.com/photo-1541819302528-768a6fdf94f1?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    reviews: 124,
    location: 'Mumbai'
  },
  {
    _id: 'fs2',
    role: 'AC Mechanic',
    name: 'Suresh Reddy',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=200',
    rating: 4.6,
    reviews: 89,
    location: 'Hyderabad'
  },
  {
    _id: 'fs3',
    role: 'Bike Mechanic',
    name: 'Anil Singh',
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    reviews: 210,
    location: 'Bangalore'
  },
  {
    _id: 'fs4',
    role: 'Painter',
    name: 'Venkat Rao',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    reviews: 156,
    location: 'Chennai'
  },
  {
    _id: 'fs5',
    role: 'Carpenter',
    name: 'Mohan Das',
    image: 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    reviews: 78,
    location: 'Delhi'
  },
  {
    _id: 'fs6',
    role: 'Cupboard Worker',
    name: 'Ahmed Khan',
    image: 'https://images.unsplash.com/photo-1603796846097-b36976db9ce3?auto=format&fit=crop&q=80&w=200',
    rating: 4.6,
    reviews: 92,
    location: 'Pune'
  },
  {
    _id: 'fs7',
    role: 'Ceiling Worker',
    name: 'David John',
    image: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=200',
    rating: 4.4,
    reviews: 65,
    location: 'Kolkata'
  },
  {
    _id: 'fs8',
    role: 'Bike Rentals',
    name: 'Fast Wheels',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    reviews: 312,
    location: 'Goa'
  },
  {
    _id: 'fs9',
    role: 'Car Rentals',
    name: 'City Drives',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    reviews: 245,
    location: 'Mumbai'
  },
  {
    _id: 'fs10',
    role: 'Bus Rentals',
    name: 'Group Travels',
    image: 'https://images.unsplash.com/photo-1570125909232-eb2b97649f6d?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    reviews: 134,
    location: 'Hyderabad'
  },
  {
    _id: 'fs11',
    role: 'Truck Rentals',
    name: 'Logistics Pro',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=200',
    rating: 4.6,
    reviews: 189,
    location: 'Bangalore'
  },
  {
    _id: 'fs12',
    role: 'Embroidery Worker',
    name: 'Lakshmi Devi',
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    reviews: 156,
    location: 'Jaipur'
  },
  {
    _id: 'fs13',
    role: 'Stickering Worker',
    name: 'Mani Colors',
    image: 'https://images.unsplash.com/photo-1605218427306-635b2e617d98?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    reviews: 98,
    location: 'Chennai'
  },
  {
    _id: 'fs14',
    role: 'Automobiles',
    name: 'Auto Fix',
    image: 'https://images.unsplash.com/photo-1486262715619-01b8c245a357?auto=format&fit=crop&q=80&w=200',
    rating: 4.6,
    reviews: 145,
    location: 'Pune'
  },
  {
    _id: 'fs15',
    role: 'Wedding Planners',
    name: 'Dream Events',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    reviews: 210,
    location: 'Delhi'
  },
  {
    _id: 'fs16',
    role: 'Plumber',
    name: 'Ravi Teja',
    image: 'https://images.unsplash.com/photo-1621905476438-5f050ce4efdb?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    reviews: 56,
    location: 'Bhimavaram'
  },
  {
    _id: 'fs17',
    role: 'Electrician',
    name: 'K. Srinivas',
    image: 'https://images.unsplash.com/photo-1558618666-adbde4cb9206?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    reviews: 82,
    location: 'Vijayawada'
  }
];
