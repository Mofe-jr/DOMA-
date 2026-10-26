/**
 * DOMA.ng - Cloud Infrastructure & Database Configuration
 * Supabase (PostgreSQL Database & Auth) & Cloudinary (CDN Media Delivery)
 *
 * The anon key is designed to be public. What protects the data is the Row Level
 * Security in supabase_schema.sql, so every permission check that matters happens
 * in the database, not in this file.
 */

const DOMA_CONFIG = Object.freeze({
  supabaseUrl: 'https://uwbbdwydadolmoffmwky.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YmJkd3lkYWRvbG1vZmZtd2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDQwODcsImV4cCI6MjEwODAyMDA4N30.TzHBgqVz68-_h8ePF6-qkf6u1BfsJC9UwEfWD-MbyuA',
  // Use a *signed* or tightly restricted upload preset in production.
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: ''
});

function mapProfile(p) {
  return {
    id: p.id,
    email: p.email,
    fullName: p.full_name || '',
    role: p.role,
    phone: p.phone || '',
    state: p.state || '',
    university: p.university || null,
    targetBudget: p.target_budget !== null && p.target_budget !== undefined ? Number(p.target_budget) : null,
    preferredType: p.preferred_type || null,
    preferredArea: p.preferred_area || null,
    agency: p.agency || null,
    joinedAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : ''
  };
}

function mapAgent(a) {
  return {
    id: a.id,
    userId: a.user_id,
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
  };
}

function mapListing(l) {
  return {
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
    isActive: l.is_active,
    createdAt: l.created_at
  };
}

// Turn Supabase/PostgREST errors into messages people can act on
function friendlyError(error, fallback) {
  const msg = (error && error.message) || '';
  if (/row-level security|permission denied/i.test(msg)) {
    return new Error('You do not have permission to do that. Please sign in with the right account.');
  }
  if (/Invalid login credentials/i.test(msg)) return new Error('Incorrect email or password.');
  if (/Email not confirmed/i.test(msg)) return new Error('Please confirm your email first. Check your inbox for the link.');
  if (/User already registered/i.test(msg)) return new Error('An account with this email already exists. Please sign in instead.');
  return new Error(msg || fallback);
}

class DomaCloudService {
  constructor() {
    this.config = DOMA_CONFIG;
    this.supabaseClient = null;
    this._profilePromise = null;

    if (window.supabase && this.config.supabaseUrl && this.config.supabaseAnonKey) {
      try {
        this.supabaseClient = window.supabase.createClient(this.config.supabaseUrl, this.config.supabaseAnonKey);
        this.supabaseClient.auth.onAuthStateChange(() => {
          this._profilePromise = null;
        });
      } catch (err) {
        console.warn('Supabase initialization error:', err);
      }
    }
  }

  isSupabaseConnected() {
    return !!this.supabaseClient;
  }

  isCloudinaryConnected() {
    return !!(this.config.cloudinaryCloudName && this.config.cloudinaryUploadPreset);
  }

  requireClient() {
    if (!this.supabaseClient) {
      throw new Error('Cannot reach the DOMA database. Check your internet connection and reload.');
    }
    return this.supabaseClient;
  }

  // ==========================================
  // AUTHENTICATION (Supabase Auth)
  // ==========================================
  async getSession() {
    if (!this.supabaseClient) return null;
    const { data } = await this.supabaseClient.auth.getSession();
    return data ? data.session : null;
  }

  /** Signed-in user's profile, or null. Cached until the auth state changes. */
  getCurrentUser() {
    if (!this._profilePromise) {
      this._profilePromise = this.loadProfile().catch(err => {
        console.warn('Profile load error:', err);
        this._profilePromise = null;
        return null;
      });
    }
    return this._profilePromise;
  }

  async loadProfile() {
    const session = await this.getSession();
    if (!session) return null;

    const { data, error } = await this.supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) throw error;
    if (data) return mapProfile(data);

    // Profile trigger has not run (schema not applied yet). Never trust a role from
    // client-side metadata here; the database is the only source of roles.
    const meta = session.user.user_metadata || {};
    return mapProfile({ id: session.user.id, email: session.user.email, full_name: meta.full_name, role: 'student' });
  }

  async signIn(email, password) {
    const client = this.requireClient();
    const { error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw friendlyError(error, 'Sign in failed.');
    this._profilePromise = null;
    const profile = await this.getCurrentUser();
    if (!profile) throw new Error('Signed in, but your profile could not be loaded. Please try again.');
    return profile;
  }

  /** Returns { user, needsConfirmation }. user is null until the email is confirmed. */
  async signUp(userData) {
    const client = this.requireClient();
    const { data, error } = await client.auth.signUp({
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      options: {
        emailRedirectTo: new URL('auth.html', window.location.href).href,
        data: {
          full_name: (userData.fullName || '').trim(),
          role: userData.role,
          phone: userData.phone || null,
          state: userData.state || null,
          university: userData.university || null,
          target_budget: userData.targetBudget ? String(userData.targetBudget) : null,
          preferred_type: userData.preferredType || null,
          preferred_area: userData.preferredArea || null,
          agency: userData.agency || null
        }
      }
    });
    if (error) throw friendlyError(error, 'Registration failed.');

    if (!data.session) {
      return { user: null, needsConfirmation: true };
    }
    this._profilePromise = null;
    return { user: await this.getCurrentUser(), needsConfirmation: false };
  }

  async signOut() {
    if (this.supabaseClient) await this.supabaseClient.auth.signOut();
    this._profilePromise = null;
  }

  async sendPasswordReset(email) {
    const client = this.requireClient();
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: new URL('auth.html?mode=reset', window.location.href).href
    });
    if (error) throw friendlyError(error, 'Could not send the reset email.');
  }

  async updatePassword(newPassword) {
    const client = this.requireClient();
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw friendlyError(error, 'Could not update your password.');
  }

  onAuthChange(callback) {
    if (!this.supabaseClient) return;
    this.supabaseClient.auth.onAuthStateChange((event, session) => callback(event, session));
  }

  // ==========================================
  // AGENTS & KYC
  // ==========================================
  async getMyAgent() {
    const session = await this.getSession();
    if (!session) return null;
    const { data, error } = await this.supabaseClient
      .from('agents')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) {
      console.warn('getMyAgent error:', error);
      return null;
    }
    return data ? mapAgent(data) : null;
  }

  /** Create or update the signed-in agent's KYC application. Status is set by the database. */
  async submitAgentApplication(agent) {
    const client = this.requireClient();
    const session = await this.getSession();
    if (!session) throw new Error('Please sign in to your agent account first.');

    const payload = {
      name: agent.name,
      agency: agent.agency,
      phone: agent.phone,
      email: session.user.email,
      state: agent.state,
      cac: agent.cac,
      nin: agent.nin,
      id_type: agent.idType,
      id_number: agent.idNumber,
      campus_focus: agent.campusFocus,
      office_address: agent.officeAddress
    };

    const existing = await this.getMyAgent();
    const query = existing
      ? client.from('agents').update(payload).eq('id', existing.id)
      : client.from('agents').insert({ ...payload, user_id: session.user.id });

    const { data, error } = await query.select().single();
    if (error) throw friendlyError(error, 'Could not save your KYC application.');
    return mapAgent(data);
  }

  /** Admin only: RLS returns just your own row for anyone else. */
  async getAgents() {
    const client = this.requireClient();
    const { data, error } = await client.from('agents').select('*').order('created_at', { ascending: false });
    if (error) throw friendlyError(error, 'Could not load agent applications.');
    return data.map(mapAgent);
  }

  async updateAgentKYC(agentId, kycStatus, rejectionReason = '') {
    const client = this.requireClient();
    const { data, error } = await client
      .from('agents')
      .update({
        kyc_status: kycStatus,
        rejection_reason: kycStatus === 'rejected' ? rejectionReason : null
      })
      .eq('id', agentId)
      .select()
      .single();
    if (error) throw friendlyError(error, 'Could not update KYC status.');
    return mapAgent(data);
  }

  // ==========================================
  // LISTINGS
  // ==========================================
  /** Active listings, newest first. Returns null if the database could not be reached. */
  async getListings() {
    if (!this.supabaseClient) return null;
    try {
      const { data, error } = await this.supabaseClient
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapListing);
    } catch (e) {
      console.warn('Supabase getListings error:', e);
      return null;
    }
  }

  async saveListing(listing) {
    const client = this.requireClient();
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

    const { data, error } = await client.from('listings').insert(payload).select().single();
    if (error) throw friendlyError(error, 'Could not publish the listing.');
    return mapListing(data);
  }

  async deleteListing(listingId) {
    const client = this.requireClient();
    // .select() makes a policy refusal visible: zero rows back means nothing was deleted
    const { data, error } = await client.from('listings').delete().eq('id', listingId).select('id');
    if (error) throw friendlyError(error, 'Could not delete the listing.');
    if (!data || data.length === 0) throw new Error('Listing not found, or you are not allowed to delete it.');
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
      const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('folder', 'doma_nigeria_properties');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint);

      if (xhr.upload && typeof onProgress === 'function') {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
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
            if (errRes.error && errRes.error.message) errMsg = errRes.error.message;
          } catch (e) {}
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => reject(new Error('Network error occurred during Cloudinary upload.'));
      xhr.send(formData);
    });
  }
}

// Global Singleton Instance
window.DOMA_CLOUD = new DomaCloudService();
