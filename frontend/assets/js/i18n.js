(function(){
  const DICT = {
    en: {
      app_title: 'Tourist Safety Dashboard',
      nav_dashboard: 'Dashboard',
      nav_alerts: 'Alerts',
      nav_geofence: 'Geofence',
      nav_analytics: 'Analytics',
      nav_audit: 'Audit',
      nav_settings: 'Settings',
      logout: 'Logout',
      theme: 'Theme',
      filters_district: 'District',
      filters_type: 'Type',
      filters_highrisk: 'High-risk zones only',
      type_all: 'All', type_domestic: 'Domestic', type_foreign: 'Foreign',
      risk_map: 'Risk Map', live: 'Live',
      map_layers: 'Map Layers', layer_flood: 'Flood Risk', layer_rain: 'Rainfall Level', layer_water: 'Water Level', layer_pop: 'Population Density',
      flood_legend: 'Flood Risk', risk_low: 'Low Risk', risk_medium: 'Medium Risk', risk_high: 'High Risk',
      sos_active: 'Active SOS Alerts',
      lang_select_title: 'Choose Language',
      lang_english: 'English',
      lang_hindi: 'Hindi',
      settings_title: 'Settings',
      appearance: 'Appearance',
      theme_label: 'Theme',
      preferences: 'Preferences',
      security: 'Security',
      export_pdf: 'Export PDF (Demo)',
      analytics_density: 'Tourist Density Heatmap (Demo)',
      analytics_incidents: 'Incidents Over Time (Demo)',
      analytics_safety: 'Safety Score Pattern (Demo)',
      analytics_reports: 'Exportable Reports',
      profiles_count: 'Profiles',
      ack: 'Acknowledge',
      resolve: 'Resolve',
      open_profile: 'Open Profile',
      tourist_id: 'Tourist ID',
      name: 'Name',
      phone: 'Phone',
      emergency: 'Emergency'
    },
    hi: {
      app_title: 'पर्यटक सुरक्षा डैशबोर्ड',
      nav_dashboard: 'डैशबोर्ड',
      nav_alerts: 'अलर्ट',
      nav_geofence: 'जियोफेंस',
      nav_analytics: 'विश्लेषण',
      nav_audit: 'ऑडिट',
      nav_settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
      theme: 'थीम',
      filters_district: 'जिला',
      filters_type: 'प्रकार',
      filters_highrisk: 'केवल उच्च-जोखिम क्षेत्र',
      type_all: 'सभी', type_domestic: 'घरेलू', type_foreign: 'विदेशी',
      risk_map: 'जोखिम मानचित्र', live: 'लाइव',
      map_layers: 'मानचित्र लेयर्स', layer_flood: 'बाढ़ जोखिम', layer_rain: 'वर्षा स्तर', layer_water: 'जल स्तर', layer_pop: 'जनसंख्या घनत्व',
      flood_legend: 'बाढ़ जोखिम', risk_low: 'कम जोखिम', risk_medium: 'मध्यम जोखिम', risk_high: 'उच्च जोखिम',
      sos_active: 'सक्रिय SOS अलर्ट',
      lang_select_title: 'भाषा चुनें',
      lang_english: 'अंग्रेज़ी',
      lang_hindi: 'हिंदी',
      settings_title: 'सेटिंग्स',
      appearance: 'रूप',
      theme_label: 'थीम',
      preferences: 'वरीयताएँ',
      security: 'सुरक्षा',
      export_pdf: 'PDF निर्यात (डेमो)',
      analytics_density: 'पर्यटक घनत्व हीटमैप (डेमो)',
      analytics_incidents: 'समय के साथ घटनाएँ (डेमो)',
      analytics_safety: 'सुरक्षा स्कोर पैटर्न (डेमो)',
      analytics_reports: 'निर्यात योग्य रिपोर्ट',
      profiles_count: 'प्रोफाइल',
      ack: 'स्वीकृत करें',
      resolve: 'समाधान करें',
      open_profile: 'प्रोफाइल खोलें',
      tourist_id: 'पर्यटक आईडी',
      name: 'नाम',
      phone: 'फ़ोन',
      emergency: 'आपातकाल'
    }
  };

  function getLang(){ return localStorage.getItem('lang') || 'en'; }
  function setLang(lang){ localStorage.setItem('lang', lang); }
  function t(key){ const lang=getLang(); return (DICT[lang] && DICT[lang][key]) || (DICT.en[key]||key); }
  function apply(root=document){
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.getAttribute('data-i18n');
      const txt=t(key);
      if (el.tagName==='INPUT' || el.tagName==='TEXTAREA') { el.setAttribute('placeholder', txt); }
      else el.textContent = txt;
    });
    // options translation
    root.querySelectorAll('select [data-i18n]').forEach(opt=>{ opt.textContent = t(opt.getAttribute('data-i18n')); });
  }

  window.I18N = { getLang, setLang, apply, t };
})();
