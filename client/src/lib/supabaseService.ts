import { supabase } from './supabase';

// Types
export interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  license_number?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id?: string;
  customer_id: string;
  service_type: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id?: string;
  customer_id: string;
  document_type: string;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  uploaded_at?: string;
}

export interface Feedback {
  id?: string;
  customer_id?: string;
  rating: number;
  feedback_text?: string;
  submitted_at?: string;
}

export interface StepConfirmation {
  id?: string;
  customer_id: string;
  service_id?: string;
  step_name: string;
  status?: string;
  confirmed_at?: string;
  created_at?: string;
}

// Customer Operations
export const customerService = {
  async create(customer: Customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching customer:', error);
      throw error;
    }
    return data;
  },

  async getByPhone(phone: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching customer:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, customer: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...customer, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
    return data;
  },
};

// Service Operations
export const serviceService = {
  async create(service: Service) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      throw error;
    }
    return data;
  },

  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, service: Partial<Service>) {
    const { data, error } = await supabase
      .from('services')
      .update({ ...service, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      throw error;
    }
    return data;
  },
};

// Document Operations
export const documentService = {
  async create(document: Document) {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw error;
    }
    return data;
  },

  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('customer_id', customerId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
};

// Feedback Operations
export const feedbackService = {
  async create(feedback: Feedback) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedback])
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
    return data;
  },

  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('customer_id', customerId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
    return data;
  },
};

// Step Confirmation Operations
export const stepConfirmationService = {
  async create(stepConfirmation: StepConfirmation) {
    const { data, error } = await supabase
      .from('step_confirmations')
      .insert([stepConfirmation])
      .select()
      .single();

    if (error) {
      console.error('Error creating step confirmation:', error);
      throw error;
    }
    return data;
  },

  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('step_confirmations')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching step confirmations:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, stepConfirmation: Partial<StepConfirmation>) {
    const { data, error } = await supabase
      .from('step_confirmations')
      .update(stepConfirmation)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating step confirmation:', error);
      throw error;
    }
    return data;
  },
};
