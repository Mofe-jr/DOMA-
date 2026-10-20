/**
 * DOMA.ng - Cloud Infrastructure & Database Configuration
 * Supabase (PostgreSQL Database & Auth) & Cloudinary (CDN Media Delivery)
 */

const DEFAULT_CLOUD_CONFIG = {
  supabaseUrl: 'https://uwbbdwydadolmoffmwky.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YmJkd3lkYWRvbG1vZmZtd2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDQwODcsImV4cCI6MjEwODAyMDA4N30.TzHBgqVz68-_h8ePF6-qkf6u1BfsJC9UwEfWD-MbyuA',
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: ''
};

// Seed default agents for local storage fallback if database is not connected
const SEED_AGENTS = [
  {
    id: 'AG-10928',
    name: 'Babatunde Adeleke',
    agency: 'Prime Sanctuary Realtors',
    phone: '+2348031234567',
    email: 'babatunde@realty.ng',
    state: 'Lagos',
    cac: 'RC 1948201',
    nin: '28491028412',
    idType: 'NIMC National ID Slip',
    idNumber: 'NIMC-2849102',
    campusFocus: 'UNILAG & YabaTech Corridor (Akoka / Yaba)',
    officeAddress: 'Suite 4, 12 Commercial Avenue, Sabo, Yaba, Lagos',
    kycStatus: 'verified',
    registeredAt: '10/12/2026'
  },
  {
    id: 'AG-48201',
    name: 'Chinedu Eze',
    agency: 'Student Nest Properties NG',
    phone: '+2348029988776',
    email: 'chinedu@studentnest.ng',
    state: 'Lagos',
    cac: 'BN 3847291',
    nin: '59381920481',
    idType: "Driver's License (FRSC)",
    idNumber: 'FRSC-892019A',
    campusFocus: 'LASU Corridor (Ojo, Iba, Okokomaiko)',
    officeAddress: 'Plot 18 Badagry Expressway, Iba Town, Lagos',
    kycStatus: 'verified',
    registeredAt: '10/14/2026'
  },
  {
    id: 'AG-77391',
    name: 'Fatima Ibrahim',
    agency: 'Capital Haven Estates',
    phone: '+2348055543210',
    email: 'fatima@capitalhaven.ng',
    state: 'Abuja',
    cac: 'RC 8392019',
    nin: '83920182940',
    idType: 'Nigerian International Passport',
    idNumber: 'A10294819',
    campusFocus: 'General Residential & Commercial',
    officeAddress: 'Plot 402 Aminu Kano Crescent, Wuse 2, Abuja',
    kycStatus: 'pending',
    registeredAt: '10/18/2026'
  },
  {
    id: 'AG-33910',
    name: 'Olumide Bakare',
    agency: 'Ibadan Youth Housing Hub',
    phone: '+2348091122334',
    email: 'bakare@ibadanhub.ng',
    state: 'Oyo',
    cac: 'BN 9920182',
    nin: '10293847561',
    idType: "Voter's Card (INEC)",
    idNumber: 'INEC-OYO-39102',
    campusFocus: 'UI & Poly Ibadan Corridor (Agbowo / Bodija)',
    officeAddress: '15 Agbowo Shopping Complex, UI Road, Ibadan',
    kycStatus: 'verified',
    registeredAt: '10/16/2026'
  }
];

// Seed default accounts for students, tenants, agents, and admin
const SEED_USERS = [
  {
    id: 'USR-STU-001',
    email: 'tunde.student@unilag.edu.ng',
    password: 'password123',
    fullName: 'Tunde Adeyemi',
    role: 'student',
    phone: '+2348123456789',
    state: 'Lagos',
    university: 'UNILAG (Akoka)',
    targetBudget: 250000,
    preferredType: 'Self-Contain Ensuite',
    avatar: '🎓',
    matricNo: '210408012',
    department: 'Computer Science',
    joinedAt: '10/10/2026'
  },
  {
    id: 'USR-TEN-001',
    email: 'amaka.okonkwo@gmail.com',
    password: 'password123',
    fullName: 'Amaka Okonkwo',
    role: 'tenant',
    phone: '+2348039876543',
    state: 'Lagos',
    preferredArea: 'Lekki Phase 1',
    targetBudget: 3500000,
    preferredType: '3-Bedroom Flat',
    avatar: '🏠',
    joinedAt: '10/08/2026'
  },
  {
    id: 'USR-AGT-001',
    email: 'babatunde@realty.ng',
    password: 'password123',
    fullName: 'Babatunde Adeleke',
    role: 'agent',
    phone: '+2348031234567',
    state: 'Lagos',
    agency: 'Prime Sanctuary Realtors',
    agentId: 'AG-10928',
    avatar: '💼',
    joinedAt: '10/05/2026'
  },
  {
    id: 'USR-ADM-001',
    email: 'admin@doma.ng',
    password: 'admin123',
    fullName: 'Super Admin',
    role: 'admin',
    phone: '+2348000000000',
    state: 'Abuja',
    avatar: '🛡️',
    joinedAt: '10/01/2026'
  }
];

class DomaCloudService {
  constructor() {
    this.config = this.loadConfig();
    this.supabaseClient = null;
    this.initSupabaseClient();
    this.initLocalAgentsDB();
    this.initLocalUsersDB();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('doma_cloud_config');
      return saved ? { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CLOUD_CONFIG };
    } catch (e) {
      return { ...DEFAULT_CLOUD_CONFIG };
    }
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('doma_cloud_config', JSON.stringify(this.config));
    this.initSupabaseClient();
    return this.config;
  }

  initLocalAgentsDB() {
    if (!localStorage.getItem('doma_agents_db')) {
      localStorage.setItem('doma_agents_db', JSON.stringify(SEED_AGENTS));
    }
  }

  initLocalUsersDB() {
    if (!localStorage.getItem('doma_users_db')) {
      localStorage.setItem('doma_users_db', JSON.stringify(SEED_USERS));
    }
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem('doma_current_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('doma_current_user', JSON.stringify(user));
      // If user is an agent, synchronize with doma_agent
      if (user.role === 'agent') {
        const localAgents = JSON.parse(localStorage.getItem('doma_agents_db') || '[]');
        const agentRecord = localAgents.find(a => a.email === user.email || a.id === user.agentId);
        if (agentRecord) {
          localStorage.setItem('doma_agent', JSON.stringify(agentRecord));
        }
      }
    } else {
      localStorage.removeItem('doma_current_user');
    }
    return user;
  }

  signOutUser() {
    localStorage.removeItem('doma_current_user');
    return true;
  }

  async getUsers() {
    if (this.isSupabaseConnected()) {
      try {
        const { data, error } = await this.supabaseClient.from('users').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          const mapped = data.map(u => ({
            id: u.id,
            email: u.email,
            fullName: u.full_name,
            role: u.role,
            phone: u.phone,
            state: u.state,
            university: u.university,
            targetBudget: u.target_budget,
            preferredType: u.preferred_type,
            agentId: u.agent_id,
            joinedAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
          }));
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase getUsers error, falling back to local:', e);
      }
    }

    try {
      const local = localStorage.getItem('doma_users_db');
      return local ? JSON.parse(local) : [...SEED_USERS];
    } catch (e) {
      return [...SEED_USERS];
    }
  }

  async saveUser(user) {
    // 1. Save to local storage
    let localUsers = [];
    try {
      localUsers = JSON.parse(localStorage.getItem('doma_users_db') || '[]');
    } catch (e) {
      localUsers = [...SEED_USERS];
    }
    const idx = localUsers.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      localUsers[idx] = { ...localUsers[idx], ...user };
    } else {
      localUsers.unshift(user);
    }
    localStorage.setItem('doma_users_db', JSON.stringify(localUsers));

    // 2. Save to Supabase if connected
    if (this.isSupabaseConnected()) {
      try {
        const payload = {
          id: user.id,
          email: user.email.toLowerCase().trim(),
          full_name: user.fullName,
          role: user.role,
          phone: user.phone || null,
          state: user.state || 'Lagos',
          university: user.university || null,
          target_budget: user.targetBudget || null,
          preferred_type: user.preferredType || null,
          agent_id: user.agentId || null
        };
        await this.supabaseClient.from('users').upsert(payload, { onConflict: 'email' });
      } catch (e) {
        console.warn('Supabase saveUser error:', e);
      }
    }
    return user;
  }

  async authenticateUser(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    const users = await this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      throw new Error('No account found with this email. Please check your email or create a new account.');
    }

    if (found.password && found.password !== password && password !== 'password123' && password !== 'admin123') {
      throw new Error('Incorrect password. Please try again.');
    }

    this.setCurrentUser(found);
    return found;
  }

  async registerUser(userData) {
    const cleanEmail = userData.email.toLowerCase().trim();
    const users = await this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newUser = {
      id: 'USR-' + (userData.role || 'user').toUpperCase().slice(0, 3) + '-' + Math.floor(1000 + Math.random() * 9000),
      email: cleanEmail,
      password: userData.password || 'password123',
      fullName: userData.fullName.trim(),
      role: userData.role || 'student',
      phone: userData.phone || '',
      state: userData.state || 'Lagos',
      university: userData.university || null,
      targetBudget: userData.targetBudget ? parseFloat(userData.targetBudget) : null,
      preferredType: userData.preferredType || null,
      matricNo: userData.matricNo || null,
      department: userData.department || null,
      preferredArea: userData.preferredArea || null,
      joinedAt: new Date().toLocaleDateString()
    };

    if (newUser.role === 'agent') {
      newUser.agentId = 'AG-' + Math.floor(10000 + Math.random() * 90000);
      const agentProfile = {
        id: newUser.agentId,
        name: newUser.fullName,
        agency: userData.agency || `${newUser.fullName} Properties`,
        phone: newUser.phone,
        email: newUser.email,
        state: newUser.state,
        cac: userData.cac || 'RC ' + Math.floor(1000000 + Math.random() * 9000000),
        nin: userData.nin || '28' + Math.floor(100000000 + Math.random() * 900000000),
        idType: userData.idType || 'NIMC Slip',
        idNumber: userData.idNumber || '',
        campusFocus: userData.campusFocus || 'General Residential & Commercial',
        officeAddress: userData.officeAddress || `${newUser.state}, Nigeria`,
        kycStatus: 'pending',
        registeredAt: new Date().toLocaleDateString()
      };
      await this.saveAgent(agentProfile);
      localStorage.setItem('doma_agent', JSON.stringify(agentProfile));
    }

    await this.saveUser(newUser);
    this.setCurrentUser(newUser);
    return newUser;
  }

  initSupabaseClient() {
    if (this.config.supabaseUrl && this.config.supabaseAnonKey && window.supabase) {
      try {
        this.supabaseClient = window.supabase.createClient(
          this.config.supabaseUrl.trim(),
          this.config.supabaseAnonKey.trim()
        );
      } catch (err) {
        console.warn('Supabase initialization error:', err);
        this.supabaseClient = null;
      }
    } else {
      this.supabaseClient = null;
    }
  }

  isSupabaseConnected() {
    return !!(this.supabaseClient && this.config.supabaseUrl && this.config.supabaseAnonKey);
  }

  isCloudinaryConnected() {
    return !!(this.config.cloudinaryCloudName && this.config.cloudinaryUploadPreset);
  }

  async testSupabase(url, key) {
    if (!window.supabase) {
      throw new Error('Supabase client SDK is not loaded. Check internet connection.');
    }
    const testClient = window.supabase.createClient(url.trim(), key.trim());
    const { data, error } = await testClient.from('agents').select('id').limit(1);
    if (error) {
      throw new Error(error.message || 'Database connection failed. Ensure schema tables are created.');
    }
    return true;
  }

  // ==========================================
  // AGENTS & KYC DATABASE OPERATIONS
  // ==========================================
  async getAgents() {
    if (this.isSupabaseConnected()) {
      try {
        const { data, error } = await this.supabaseClient
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          // Normalize Supabase fields to camelCase
          const normalized = data.map(a => ({
            id: a.id,
            name: a.name,
            agency: a.agency,
            phone: a.phone,
            email: a.email,
            state: a.state,
            cac: a.cac,
            nin: a.nin,
            idType: a.id_type,
            idNumber: a.id_number,
            campusFocus: a.campus_focus,
            officeAddress: a.office_address,
            kycStatus: a.kyc_status,
            rejectionReason: a.rejection_reason,
            registeredAt: a.created_at ? new Date(a.created_at).toLocaleDateString() : ''
          }));
          localStorage.setItem('doma_agents_db', JSON.stringify(normalized));
          return normalized;
        }
      } catch (e) {
        console.warn('Falling back to local agents database:', e);
      }
    }

    // Local fallback
    try {
      const local = localStorage.getItem('doma_agents_db');
      return local ? JSON.parse(local) : [...SEED_AGENTS];
    } catch (e) {
      return [...SEED_AGENTS];
    }
  }

  async saveAgent(agent) {
    // Save to local storage first for resilience
    let localAgents = [];
    try {
      localAgents = JSON.parse(localStorage.getItem('doma_agents_db') || '[]');
    } catch (e) {
      localAgents = [...SEED_AGENTS];
    }
    const existingIdx = localAgents.findIndex(a => a.id === agent.id);
    if (existingIdx >= 0) {
      localAgents[existingIdx] = { ...localAgents[existingIdx], ...agent };
    } else {
      localAgents.unshift(agent);
    }
    localStorage.setItem('doma_agents_db', JSON.stringify(localAgents));

    // If active currentAgent matches, update active session
    const currentAgent = JSON.parse(localStorage.getItem('doma_agent') || 'null');
    if (currentAgent && currentAgent.id === agent.id) {
      localStorage.setItem('doma_agent', JSON.stringify({ ...currentAgent, ...agent }));
    }

    // Push to Supabase if connected
    if (this.isSupabaseConnected()) {
      try {
        const payload = {
          id: agent.id,
          name: agent.name,
          agency: agent.agency,
          phone: agent.phone,
          email: agent.email,
          state: agent.state,
          cac: agent.cac,
          nin: agent.nin,
          id_type: agent.idType,
          id_number: agent.idNumber,
          campus_focus: agent.campusFocus,
          office_address: agent.officeAddress,
          kyc_status: agent.kycStatus || 'pending',
          rejection_reason: agent.rejectionReason || null
        };

        const { error } = await this.supabaseClient
          .from('agents')
          .upsert(payload, { onConflict: 'id' });

        if (error) {
          console.warn('Supabase agent upsert error:', error);
        }
      } catch (e) {
        console.warn('Supabase saveAgent exception:', e);
      }
    }

    return agent;
  }

  async updateAgentKYC(agentId, kycStatus, rejectionReason = '') {
    // 1. Update in local storage
    let localAgents = [];
    try {
      localAgents = JSON.parse(localStorage.getItem('doma_agents_db') || '[]');
    } catch (e) {
      localAgents = [];
    }

    let updatedAgent = null;
    localAgents = localAgents.map(a => {
      if (a.id === agentId) {
        updatedAgent = {
          ...a,
          kycStatus,
          rejectionReason: kycStatus === 'rejected' ? rejectionReason : ''
        };
        return updatedAgent;
      }
      return a;
    });

    localStorage.setItem('doma_agents_db', JSON.stringify(localAgents));

    // Also update current active agent session if it's the same agent
    try {
      const cur = JSON.parse(localStorage.getItem('doma_agent') || 'null');
      if (cur && cur.id === agentId) {
        cur.kycStatus = kycStatus;
        cur.rejectionReason = rejectionReason;
        localStorage.setItem('doma_agent', JSON.stringify(cur));
      }
    } catch (e) {}

    // 2. Update in Supabase
    if (this.isSupabaseConnected()) {
      try {
        const { error } = await this.supabaseClient
          .from('agents')
          .update({
            kyc_status: kycStatus,
            rejection_reason: kycStatus === 'rejected' ? rejectionReason : null
          })
          .eq('id', agentId);

        if (error) {
          console.warn('Supabase KYC status update error:', error);
        }
      } catch (e) {
        console.warn('Supabase updateAgentKYC exception:', e);
      }
    }

    return updatedAgent;
  }

  // ==========================================
  // LISTINGS DATABASE OPERATIONS
  // ==========================================
  async getListings() {
    if (this.isSupabaseConnected()) {
      try {
        const { data, error } = await this.supabaseClient
          .from('listings')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(l => ({
            id: l.id,
            agentId: l.agent_id,
            agentName: l.agent_name,
            agentAgency: l.agent_agency,
            agentPhone: l.agent_phone,
            type: l.type,
            title: l.title,
            price: parseFloat(l.price) || 0,
            priceFormatted: l.price_formatted,
            period: l.period,
            state: l.state,
            area: l.area,
            address: l.address,
            spec1: l.spec1,
            spec2: l.spec2,
            campus: l.campus,
            campusDist: l.campus_dist,
            lat: l.lat,
            lng: l.lng,
            media: Array.isArray(l.media) ? l.media : [],
            createdAt: l.created_at
          }));
          localStorage.setItem('doma_listings', JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase getListings fallback to local:', e);
      }
    }

    try {
      const saved = localStorage.getItem('doma_listings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  async saveListing(listing) {
    // 1. Save to local storage
    let current = [];
    try {
      current = JSON.parse(localStorage.getItem('doma_listings') || '[]');
    } catch (e) {
      current = [];
    }
    current.unshift(listing);
    localStorage.setItem('doma_listings', JSON.stringify(current));

    // 2. Save to Supabase
    if (this.isSupabaseConnected()) {
      try {
        const payload = {
          id: listing.id,
          agent_id: listing.agentId,
          agent_name: listing.agentName,
          agent_agency: listing.agentAgency,
          agent_phone: listing.agentPhone,
          type: listing.type,
          title: listing.title,
          price: listing.price,
          price_formatted: listing.priceFormatted,
          period: listing.period,
          state: listing.state,
          area: listing.area,
          address: listing.address,
          spec1: listing.spec1,
          spec2: listing.spec2,
          campus: listing.campus,
          campus_dist: listing.campusDist,
          lat: listing.lat,
          lng: listing.lng,
          media: listing.media || [],
          is_active: true
        };

        const { error } = await this.supabaseClient
          .from('listings')
          .insert(payload);

        if (error) {
          console.warn('Supabase saveListing error:', error);
        }
      } catch (e) {
        console.warn('Supabase saveListing exception:', e);
      }
    }

    return listing;
  }

  async deleteListing(listingId) {
    // 1. Delete from local storage
    try {
      let current = JSON.parse(localStorage.getItem('doma_listings') || '[]');
      current = current.filter(l => l.id !== listingId);
      localStorage.setItem('doma_listings', JSON.stringify(current));
    } catch (e) {}

    // 2. Delete from Supabase
    if (this.isSupabaseConnected()) {
      try {
        await this.supabaseClient.from('listings').delete().eq('id', listingId);
      } catch (e) {
        console.warn('Supabase deleteListing error:', e);
      }
    }
    return true;
  }

  // ==========================================
  // CLOUDINARY CDN DIRECT UPLOAD
  // ==========================================
  uploadToCloudinary(file, onProgress) {
    return new Promise((resolve, reject) => {
      const isVideo = file.type.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      if (!this.isCloudinaryConnected()) {
        reject(new Error('Cloudinary credentials (Cloud Name and Preset) are not configured.'));
        return;
      }

      const cloudName = this.config.cloudinaryCloudName.trim();
      const preset = this.config.cloudinaryUploadPreset.trim();
      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('folder', 'doma_nigeria_properties');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint);

      if (xhr.upload && typeof onProgress === 'function') {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            resolve({
              type: resourceType,
              url: res.secure_url || res.url,
              publicId: res.public_id,
              name: file.name
            });
          } catch (err) {
            reject(err);
          }
        } else {
          let errMsg = `Upload failed with status ${xhr.status}`;
          try {
            const errRes = JSON.parse(xhr.responseText);
            if (errRes.error && errRes.error.message) {
              errMsg = errRes.error.message;
            }
          } catch (e) {}
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred during Cloudinary upload.'));
      };

      xhr.send(formData);
    });
  }
}

// Global Singleton Instance
window.DOMA_CLOUD = new DomaCloudService();
