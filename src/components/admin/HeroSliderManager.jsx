import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, ArrowUp, ArrowDown, Loader2, Upload } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const HeroSliderManager = () => {
    const { settings, refreshData } = useAppSettings();
    const [slides, setSlides] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const fileInputRefs = useRef({});

    useEffect(() => {
        if (settings.homeHeroSlides) {
            setSlides(settings.homeHeroSlides.sort((a, b) => a.sort_order - b.sort_order).map(s => ({ ...s, newImageFile: null, imagePreviewUrl: null })));
        }
    }, [settings.homeHeroSlides]);

    const handleAddSlide = () => {
        const newSlide = {
            id: `new-${Date.now()}`,
            tagline1: 'New Tagline 1',
            tagline2: 'New Tagline 2',
            subtitle: 'New subtitle text.',
            cta_text: 'Get Started',
            cta_link: '/quote',
            background_image: null,
            sort_order: slides.length,
            newImageFile: null,
            imagePreviewUrl: null,
        };
        setSlides([...slides, newSlide]);
    };

    const handleRemoveSlide = (id) => {
        setSlides(slides.filter(slide => slide.id !== id));
    };

    const handleInputChange = (id, field, value) => {
        setSlides(slides.map(slide => slide.id === id ? { ...slide, [field]: value } : slide));
    };
    
    const handleImageChange = (id, file) => {
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setSlides(slides.map(slide => slide.id === id ? { ...slide, newImageFile: file, imagePreviewUrl: previewUrl } : slide));
        }
    };

    const handleMoveSlide = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === slides.length - 1)) {
            return;
        }
        const newSlides = [...slides];
        const slide = newSlides.splice(index, 1)[0];
        newSlides.splice(index + direction, 0, slide);
        setSlides(newSlides);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Upload images first
            const slidesWithImageUploads = await Promise.all(slides.map(async (slide) => {
                if (slide.newImageFile) {
                    const file = slide.newImageFile;
                    const fileName = `${Date.now()}-${file.name}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(`hero-slider/${fileName}`, file);

                    if (uploadError) {
                        throw new Error(`Image upload failed for slide ${slide.id}: ${uploadError.message}`);
                    }

                    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(uploadData.path);
                    return { ...slide, background_image: publicUrl, newImageFile: null, imagePreviewUrl: null };
                }
                return slide;
            }));

            const updatedSlides = slidesWithImageUploads.map((slide, index) => ({
                id: slide.id,
                tagline1: slide.tagline1,
                tagline2: slide.tagline2,
                subtitle: slide.subtitle,
                cta_text: slide.cta_text,
                cta_link: slide.cta_link,
                background_image: slide.background_image,
                sort_order: index,
            }));

            const upsertPromises = updatedSlides.map(slide => {
                const { id, ...dataToSave } = slide;
                if (typeof id === 'string' && id.startsWith('new-')) {
                    return supabase.from('home_hero_slides').insert(dataToSave).select().single();
                }
                return supabase.from('home_hero_slides').update(dataToSave).eq('id', id);
            });
            
            const existingIds = settings.homeHeroSlides.map(s => s.id);
            const currentIds = slides.map(s => s.id).filter(id => typeof id !== 'string' || !id.startsWith('new-'));
            const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
            const deletePromises = idsToDelete.map(id => supabase.from('home_hero_slides').delete().eq('id', id));

            const allPromises = [...upsertPromises, ...deletePromises];
            const results = await Promise.all(allPromises);

            const errors = results.filter(res => res && res.error);
            if (errors.length > 0) {
                throw new Error(errors.map(e => e.error.message).join(', '));
            }

            await refreshData();
            toast({
                title: "✅ Hero Slides Updated",
                description: "The hero slider has been saved successfully.",
            });
        } catch (error) {
            console.error("Save failed:", error);
            toast({
                title: "❌ Save Failed",
                description: `An error occurred: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Hero Slider Management</h3>
                <div>
                    <Button onClick={handleAddSlide} variant="outline" className="mr-2">
                        <Plus className="w-4 h-4 mr-2" /> Add Slide
                    </Button>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-yellow-400" disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {slides.map((slide, index) => (
                    <div key={slide.id} className="border p-4 rounded-lg space-y-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-lg">Slide {index + 1}</h4>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleMoveSlide(index, -1)} disabled={index === 0}>
                                    <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleMoveSlide(index, 1)} disabled={index === slides.length - 1}>
                                    <ArrowDown className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRemoveSlide(slide.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`tagline1-${slide.id}`}>Tagline 1</Label>
                                <Input id={`tagline1-${slide.id}`} type="text" value={slide.tagline1 || ''} onChange={(e) => handleInputChange(slide.id, 'tagline1', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor={`tagline2-${slide.id}`}>Tagline 2</Label>
                                <Input id={`tagline2-${slide.id}`} type="text" value={slide.tagline2 || ''} onChange={(e) => handleInputChange(slide.id, 'tagline2', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor={`subtitle-${slide.id}`}>Subtitle</Label>
                            <textarea id={`subtitle-${slide.id}`} value={slide.subtitle || ''} onChange={(e) => handleInputChange(slide.id, 'subtitle', e.target.value)} className="w-full p-2 border rounded" rows="2"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`cta_text-${slide.id}`}>CTA Button Text</Label>
                                <Input id={`cta_text-${slide.id}`} type="text" value={slide.cta_text || ''} onChange={(e) => handleInputChange(slide.id, 'cta_text', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor={`cta_link-${slide.id}`}>CTA Button Link</Label>
                                <Input id={`cta_link-${slide.id}`} type="text" value={slide.cta_link || ''} onChange={(e) => handleInputChange(slide.id, 'cta_link', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label>Background Image</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="w-32 h-20 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                                    {(slide.imagePreviewUrl || slide.background_image) ? (
                                        <img-replace src={slide.imagePreviewUrl || slide.background_image} alt={`Slide ${index + 1} preview`} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-gray-500">No Image</span>
                                    )}
                                </div>
                                <Button type="button" variant="outline" onClick={() => fileInputRefs.current[slide.id]?.click()}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Change Image
                                </Button>
                                <Input 
                                    type="file" 
                                    className="hidden" 
                                    ref={el => fileInputRefs.current[slide.id] = el}
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={(e) => handleImageChange(slide.id, e.target.files[0])} 
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroSliderManager;