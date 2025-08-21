import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const QuoteCalculatorManager = () => {
  const { refreshData } = useAppSettings();
  const [animationTypes, setAnimationTypes] = useState([]);
  const [animationStyles, setAnimationStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: typesData, error: typesError } = await supabase.from('quote_animation_types').select('*');
        if (typesError) throw typesError;
        setAnimationTypes(typesData);

        const { data: stylesData, error: stylesError } = await supabase.from('quote_animation_styles').select('*');
        if (stylesError) throw stylesError;
        setAnimationStyles(stylesData);
      } catch (error) {
        toast({ title: 'Error fetching data', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleTypeChange = (index, field, value) => {
    const newTypes = [...animationTypes];
    newTypes[index][field] = value;
    setAnimationTypes(newTypes);
  };

  const handleStyleChange = (index, field, value) => {
    const newStyles = [...animationStyles];
    newStyles[index][field] = value;
    setAnimationStyles(newStyles);
  };

  const addType = () => {
    setAnimationTypes([...animationTypes, { id: `new-${Date.now()}`, name: '', value: '', base_cost: 0 }]);
  };

  const addStyle = () => {
    setAnimationStyles([...animationStyles, { id: `new-${Date.now()}`, name: '', value: '', cost_multiplier: 1 }]);
  };

  const removeType = async (id, index) => {
    if (typeof id === 'string' && id.startsWith('new-')) {
      setAnimationTypes(animationTypes.filter((_, i) => i !== index));
      return;
    }
    try {
      const { error } = await supabase.from('quote_animation_types').delete().eq('id', id);
      if (error) throw error;
      setAnimationTypes(animationTypes.filter(t => t.id !== id));
      toast({ title: 'Success', description: 'Animation type removed.' });
      await refreshData();
    } catch (error) {
      toast({ title: 'Error removing type', description: error.message, variant: 'destructive' });
    }
  };

  const removeStyle = async (id, index) => {
    if (typeof id === 'string' && id.startsWith('new-')) {
      setAnimationStyles(animationStyles.filter((_, i) => i !== index));
      return;
    }
    try {
      const { error } = await supabase.from('quote_animation_styles').delete().eq('id', id);
      if (error) throw error;
      setAnimationStyles(animationStyles.filter(s => s.id !== id));
      toast({ title: 'Success', description: 'Animation style removed.' });
      await refreshData();
    } catch (error) {
      toast({ title: 'Error removing style', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const typePromises = animationTypes.map(type => {
        const { id, ...data } = type;
        if (typeof id === 'string' && id.startsWith('new-')) {
          return supabase.from('quote_animation_types').insert(data);
        }
        return supabase.from('quote_animation_types').update(data).eq('id', id);
      });

      const stylePromises = animationStyles.map(style => {
        const { id, ...data } = style;
        if (typeof id === 'string' && id.startsWith('new-')) {
          return supabase.from('quote_animation_styles').insert(data);
        }
        return supabase.from('quote_animation_styles').update(data).eq('id', id);
      });

      const allPromises = [...typePromises, ...stylePromises];
      const results = await Promise.all(allPromises);
      
      const error = results.find(res => res.error);
      if (error) throw error.error;
      
      toast({ title: 'Success', description: 'Quote calculator settings saved.' });
      await refreshData();
    } catch (error) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div className="flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quote Calculator Settings</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Animation Types */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Animation Types</h3>
            <Button onClick={addType} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Type</Button>
          </div>
          {animationTypes.map((type, index) => (
            <div key={type.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-md">
              <input value={type.name} onChange={(e) => handleTypeChange(index, 'name', e.target.value)} placeholder="Name (e.g., 2D Animation)" className="col-span-4 p-2 border rounded" />
              <input value={type.value} onChange={(e) => handleTypeChange(index, 'value', e.target.value)} placeholder="Value (e.g., 2d)" className="col-span-3 p-2 border rounded" />
              <input type="number" value={type.base_cost} onChange={(e) => handleTypeChange(index, 'base_cost', e.target.value)} placeholder="Base Cost" className="col-span-3 p-2 border rounded" />
              <Button variant="destructive" size="icon" onClick={() => removeType(type.id, index)} className="col-span-2">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Animation Styles */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Animation Styles</h3>
            <Button onClick={addStyle} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Style</Button>
          </div>
          {animationStyles.map((style, index) => (
            <div key={style.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-md">
              <input value={style.name} onChange={(e) => handleStyleChange(index, 'name', e.target.value)} placeholder="Name (e.g., Standard)" className="col-span-4 p-2 border rounded" />
              <input value={style.value} onChange={(e) => handleStyleChange(index, 'value', e.target.value)} placeholder="Value (e.g., standard)" className="col-span-3 p-2 border rounded" />
              <input type="number" step="0.1" value={style.cost_multiplier} onChange={(e) => handleStyleChange(index, 'cost_multiplier', e.target.value)} placeholder="Multiplier" className="col-span-3 p-2 border rounded" />
              <Button variant="destructive" size="icon" onClick={() => removeStyle(style.id, index)} className="col-span-2">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteCalculatorManager;