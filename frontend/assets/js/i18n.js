(function(){
  const DICT = {
    en: {
      // Common
      app_title: 'Tourist Safety Dashboard',
      safeguard: 'SafeGuard',
      platform_subtitle: 'Tourist Safety Platform',
      
      // Navigation
      nav_dashboard: 'Dashboard',
      nav_alerts: 'Emergency Alerts',
      nav_geofence: 'Safety Zones',
      nav_analytics: 'Analytics Dashboard',
      nav_audit: 'Audit Logs',
      nav_settings: 'System Settings',
      nav_help: 'Help Center',
      nav_automations: 'Smart Automations',
      
      // Sections
      section_analytics: 'Analytics & Reports',
      section_management: 'Management',
      section_support: 'Support',
      
      // Actions
      logout: 'Logout',
      login: 'Login',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      
      // Dashboard
      dashboard_title: 'Tourist Safety Dashboard',
      dashboard_subtitle: 'Real-time monitoring and risk management system',
      active_tourists: 'Active Tourists',
      safety_score: 'Safety Score',
      active_alerts: 'Active Alerts',
      response_time: 'Response Time',
      emergency_center: 'Emergency Center',
      analytics_hub: 'Analytics Hub',
      system_control: 'System Control',
      filter_options: 'Filter Options',
      live_risk_map: 'Live Risk Map',
      live_data: 'Live Data',
      
      // Filters
      filters_district: 'District',
      filters_type: 'Tourist Type',
      filters_highrisk: 'High-risk zones only',
      type_all: 'All Types',
      type_domestic: 'Domestic',
      type_foreign: 'International',
      all_districts: 'All Districts',
      
      // Risk & Map
      risk_map: 'Risk Map',
      risk_levels: 'Risk Levels',
      risk_low: 'Low Risk',
      risk_medium: 'Medium Risk',
      risk_high: 'High Risk',
      map_layers: 'Map Layers',
      layer_tourists: 'Tourist Locations',
      layer_weather: 'Weather Data',
      layer_traffic: 'Traffic Density',
      layer_flood: 'Flood Risk',
      layer_rain: 'Rainfall Level',
      layer_water: 'Water Level',
      layer_pop: 'Population Density',
      
      // Analytics
      analytics_title: 'Tourist Safety Analytics',
      analytics_subtitle: 'Monitor safety metrics and tourist activity patterns',
      total_safety_score: 'Total Safety Score',
      incidents_today: 'Incidents Today',
      safety_trends: 'Safety Trends',
      incident_types: 'Incident Types',
      risk_zone_activity: 'Risk Zone Activity',
      recent_operations: 'Recent Operations',
      performance_overview: 'Performance Overview',
      quick_actions: 'Quick Actions',
      export_report: 'Export Report',
      
      // Alerts
      alerts_title: 'Emergency Alerts',
      alerts_subtitle: 'Monitor and respond to tourist emergencies',
      alert_details: 'Alert Details',
      recent_activity: 'Recent Activity',
      view_all_alerts: 'View All Alerts',
      live_dashboard: 'Live Dashboard',
      
      // Audit
      audit_title: 'System Audit Logs',
      audit_subtitle: 'Track all system activities and user actions',
      export_logs: 'Export Logs',
      recent_activity_audit: 'Recent Activity',
      live_updates: 'Live Updates',
      
      // Settings
      settings_title: 'System Settings',
      settings_subtitle: 'Configure system preferences and security options',
      appearance_display: 'Appearance & Display',
      notifications_alerts: 'Notifications & Alerts',
      security_privacy: 'Security & Privacy',
      system_status: 'System Status',
      advanced_config: 'Advanced Configuration',
      theme_preference: 'Theme Preference',
      theme_description: 'Choose between dark and light themes',
      compact_layout: 'Compact Layout',
      compact_description: 'Reduce spacing for more content',
      language: 'Language',
      time_zone: 'Time Zone',
      sound_alerts: 'Sound Alerts',
      desktop_notifications: 'Desktop Notifications',
      email_alerts: 'Email Alerts',
      auto_logout: 'Auto Logout',
      two_factor_auth: '2FA',
      usage_analytics: 'Usage Analytics',
      
      // Geofence
      geofence_title: 'Safety Zones Management',
      geofence_subtitle: 'Configure and monitor geofenced safety areas',
      create_new_zone: 'Create New Zone',
      interactive_zone_map: 'Interactive Zone Map',
      zone_map_description: 'Click and drag to create new safety zones',
      live_tracking: 'Live Tracking',
      zone_types: 'Zone Types',
      safe_zone: 'Safe Zone',
      caution_zone: 'Caution Zone',
      restricted_zone: 'Restricted Zone',
      drawing_tools: 'Drawing Tools',
      circle_zone: 'Circle Zone',
      polygon_zone: 'Polygon Zone',
      edit_zone: 'Edit Zone',
      active_safety_zones: 'Active Safety Zones',
      zone_statistics: 'Zone Statistics',
      
      // Status
      live: 'Live',
      online: 'Online',
      offline: 'Offline',
      active: 'Active',
      inactive: 'Inactive',
      connected: 'Connected',
      running: 'Running',
      limited: 'Limited',
      
      // Languages
      lang_english: 'English',
      lang_hindi: 'हिंदी (Hindi)',
      
      // Common Actions
      ack: 'Acknowledge',
      resolve: 'Resolve',
      view_profile: 'View Profile',
      view_details: 'View Details',
      toggle_theme: 'Toggle Theme',
      
      // Form Fields
      tourist_id: 'Tourist ID',
      name: 'Name',
      phone: 'Phone',
      emergency: 'Emergency Contact',
      timestamp: 'Timestamp',
      user: 'User',
      action: 'Action',
      details: 'Details',
      status: 'Status',
      ip_address: 'IP Address',
      
      // Time
      minutes_ago: 'minutes ago',
      hours_ago: 'hours ago',
      days_ago: 'days ago',
      last_updated: 'Last Updated',
      
      // Numbers
      out_of_100: 'Out of 100',
      currently_tracked: 'Currently tracked',
      resolved_pending: 'resolved, pending',
      average_response: 'Average response',
      critical: 'Critical'
    },
    hi: {
      // Common
      app_title: 'पर्यटक सुरक्षा डैशबोर्ड',
      safeguard: 'सेफगार्ड',
      platform_subtitle: 'पर्यटक सुरक्षा प्लेटफॉर्म',
      
      // Navigation
      nav_dashboard: 'डैशबोर्ड',
      nav_alerts: 'आपातकालीन अलर्ट',
      nav_geofence: 'सुरक्षा क्षेत्र',
      nav_analytics: 'विश्लेषण डैशबोर्ड',
      nav_audit: 'ऑडिट लॉग्स',
      nav_settings: 'सिस्टम सेटिंग्स',
      nav_help: 'सहायता केंद्र',
      nav_automations: 'स्मार्ट ऑटोमेशन',
      
      // Sections
      section_analytics: 'विश्लेषण और रिपोर्ट',
      section_management: 'प्रबंधन',
      section_support: 'सहायता',
      
      // Actions
      logout: 'लॉगआउट',
      login: 'लॉगिन',
      save: 'सेव करें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      create: 'बनाएं',
      export: 'निर्यात करें',
      import: 'आयात करें',
      refresh: 'रीफ्रेश करें',
      search: 'खोजें',
      filter: 'फिल्टर करें',
      
      // Dashboard
      dashboard_title: 'पर्यटक सुरक्षा डैशबोर्ड',
      dashboard_subtitle: 'रियल-टाइम निगरानी और जोखिम प्रबंधन सिस्टम',
      active_tourists: 'सक्रिय पर्यटक',
      safety_score: 'सुरक्षा स्कोर',
      active_alerts: 'सक्रिय अलर्ट',
      response_time: 'प्रतिक्रिया समय',
      emergency_center: 'आपातकालीन केंद्र',
      analytics_hub: 'विश्लेषण हब',
      system_control: 'सिस्टम नियंत्रण',
      filter_options: 'फिल्टर विकल्प',
      live_risk_map: 'लाइव जोखिम मानचित्र',
      live_data: 'लाइव डेटा',
      
      // Filters
      filters_district: 'जिला',
      filters_type: 'पर्यटक प्रकार',
      filters_highrisk: 'केवल उच्च-जोखिम क्षेत्र',
      type_all: 'सभी प्रकार',
      type_domestic: 'घरेलू',
      type_foreign: 'अंतर्राष्ट्रीय',
      all_districts: 'सभी जिले',
      
      // Risk & Map
      risk_map: 'जोखिम मानचित्र',
      risk_levels: 'जोखिम स्तर',
      risk_low: 'कम जोखिम',
      risk_medium: 'मध्यम जोखिम',
      risk_high: 'उच्च जोखिम',
      map_layers: 'मानचित्र परतें',
      layer_tourists: 'पर्यटक स्थान',
      layer_weather: 'मौसम डेटा',
      layer_traffic: 'ट्रैफिक घनत्व',
      layer_flood: 'बाढ़ जोखिम',
      layer_rain: 'वर्षा स्तर',
      layer_water: 'जल स्तर',
      layer_pop: 'जनसंख्या घनत्व',
      
      // Analytics
      analytics_title: 'पर्यटक सुरक्षा विश्लेषण',
      analytics_subtitle: 'सुरक्षा मेट्रिक्स और पर्यटक गतिविधि पैटर्न की निगरानी करें',
      total_safety_score: 'कुल सुरक्षा स्कोर',
      incidents_today: 'आज की घटनाएं',
      safety_trends: 'सुरक्षा रुझान',
      incident_types: 'घटना प्रकार',
      risk_zone_activity: 'जोखिम क्षेत्र गतिविधि',
      recent_operations: 'हाल की गतिविधियां',
      performance_overview: 'प्रदर्शन अवलोकन',
      quick_actions: 'त्वरित कार्य',
      export_report: 'रिपोर्ट निर्यात करें',
      
      // Alerts
      alerts_title: 'आपातकालीन अलर्ट',
      alerts_subtitle: 'पर्यटक आपातकाल की निगरानी और प्रतिक्रिया',
      alert_details: 'अलर्ट विवरण',
      recent_activity: 'हाल की गतिविधि',
      view_all_alerts: 'सभी अलर्ट देखें',
      live_dashboard: 'लाइव डैशबोर्ड',
      
      // Audit
      audit_title: 'सिस्टम ऑडिट लॉग्स',
      audit_subtitle: 'सभी सिस्टम गतिविधियों और उपयोगकर्ता कार्यों को ट्रैक करें',
      export_logs: 'लॉग्स निर्यात करें',
      recent_activity_audit: 'हाल की गतिविधि',
      live_updates: 'लाइव अपडेट',
      
      // Settings
      settings_title: 'सिस्टम सेटिंग्स',
      settings_subtitle: 'सिस्टम प्राथमिकताएं और सुरक्षा विकल्प कॉन्फ़िगर करें',
      appearance_display: 'रूप और प्रदर्शन',
      notifications_alerts: 'सूचनाएं और अलर्ट',
      security_privacy: 'सुरक्षा और गोपनीयता',
      system_status: 'सिस्टम स्थिति',
      advanced_config: 'उन्नत कॉन्फ़िगरेशन',
      theme_preference: 'थीम प्राथमिकता',
      theme_description: 'डार्क और लाइट थीम के बीच चुनें',
      compact_layout: 'कॉम्पैक्ट लेआउट',
      compact_description: 'अधिक सामग्री के लिए स्पेसिंग कम करें',
      language: 'भाषा',
      time_zone: 'समय क्षेत्र',
      sound_alerts: 'ध्वनि अलर्ट',
      desktop_notifications: 'डेस्कटॉप सूचनाएं',
      email_alerts: 'ईमेल अलर्ट',
      auto_logout: 'ऑटो लॉगआउट',
      two_factor_auth: '2FA',
      usage_analytics: 'उपयोग विश्लेषण',
      
      // Geofence
      geofence_title: 'सुरक्षा क्षेत्र प्रबंधन',
      geofence_subtitle: 'जियोफेंस्ड सुरक्षा क्षेत्रों को कॉन्फ़िगर और निगरानी करें',
      create_new_zone: 'नया क्षेत्र बनाएं',
      interactive_zone_map: 'इंटरैक्टिव क्षेत्र मानचित्र',
      zone_map_description: 'नए सुरक्षा क्षेत्र बनाने के लिए क्लिक और ड्रैग करें',
      live_tracking: 'लाइव ट्रैकिंग',
      zone_types: 'क्षेत्र प्रकार',
      safe_zone: 'सुरक्षित क्षेत्र',
      caution_zone: 'सावधानी क्षेत्र',
      restricted_zone: 'प्रतिबंधित क्षेत्र',
      drawing_tools: 'ड्राइंग टूल्स',
      circle_zone: 'वृत्त क्षेत्र',
      polygon_zone: 'बहुभुज क्षेत्र',
      edit_zone: 'क्षेत्र संपादित करें',
      active_safety_zones: 'सक्रिय सुरक्षा क्षेत्र',
      zone_statistics: 'क्षेत्र आंकड़े',
      
      // Status
      live: 'लाइव',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      active: 'सक्रिय',
      inactive: 'निष्क्रिय',
      connected: 'कनेक्टेड',
      running: 'चल रहा है',
      limited: 'सीमित',
      
      // Languages
      lang_english: 'अंग्रेज़ी',
      lang_hindi: 'हिंदी',
      
      // Common Actions
      ack: 'स्वीकार करें',
      resolve: 'समाधान करें',
      view_profile: 'प्रोफाइल देखें',
      view_details: 'विवरण देखें',
      toggle_theme: 'थीम टॉगल करें',
      
      // Form Fields
      tourist_id: 'पर्यटक आईडी',
      name: 'नाम',
      phone: 'फ़ोन',
      emergency: 'आपातकालीन संपर्क',
      timestamp: 'समयचिह्न',
      user: 'उपयोगकर्ता',
      action: 'कार्य',
      details: 'विवरण',
      status: 'स्थिति',
      ip_address: 'आईपी पता',
      
      // Time
      minutes_ago: 'मिनट पहले',
      hours_ago: 'घंटे पहले',
      days_ago: 'दिन पहले',
      last_updated: 'अंतिम अपडेट',
      
      // Numbers
      out_of_100: '100 में से',
      currently_tracked: 'वर्तमान में ट्रैक किए गए',
      resolved_pending: 'हल किए गए, लंबित',
      average_response: 'औसत प्रतिक्रिया',
      critical: 'गंभीर'
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
