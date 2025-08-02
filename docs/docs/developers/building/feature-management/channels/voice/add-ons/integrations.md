---
sidebar_label: Integrations
sidebar_position: 5
title: "Integrations Add-On"
---

# Integrations Add-On

Connect Connie's voice system with external services like CRM systems, databases, and third-party APIs to enhance caller experience with context and automation.

## What It Does
- **CRM Lookup**: Automatically retrieve caller information from HubSpot, Salesforce, MySQL databases
- **Data Enrichment**: Populate agent screens with known caller details
- **3rd Party APIs**: Connect Studio Flows to external systems and services
- **Real-time Integration**: Provide contextual information during active calls
- **Automated Actions**: Trigger external processes based on call events

## When to Use
- Organizations with existing CRM or database systems
- Need caller context before agent answers
- Want to automate data entry and updates
- Integration with external workflow systems
- Compliance requires detailed call logging

## Compatible Workflows
- ✅ **Direct**: Show caller context when routing to agents
- ✅ **Direct + Options**: Personalize menu options based on caller data
- ✅ **Direct to Voicemail**: Enrich voicemail tasks with caller information

## Integration Types

### CRM Systems

#### HubSpot Integration
```javascript
const lookupHubSpotContact = async (phone_number) => {
  const response = await fetch(`https://api.hubapi.com/contacts/v1/contact/phone/${phone_number}`, {
    headers: {
      'Authorization': `Bearer ${context.HUBSPOT_ACCESS_TOKEN}`
    }
  });
  
  if (response.ok) {
    const contact = await response.json();
    return {
      name: `${contact.properties.firstname.value} ${contact.properties.lastname.value}`,
      email: contact.properties.email.value,
      company: contact.properties.company.value,
      last_contact: contact.properties.lastmodifieddate.value,
      deal_stage: contact.properties.dealstage?.value,
      vip_status: contact.properties.vip?.value === 'true'
    };
  }
  
  return null;
};
```

#### Salesforce Integration
```javascript
const lookupSalesforceContact = async (phone_number) => {
  const query = `SELECT Id, Name, Email, Account.Name, LastModifiedDate 
                 FROM Contact 
                 WHERE Phone = '${phone_number}' 
                 OR MobilePhone = '${phone_number}'`;
  
  const response = await fetch(`${context.SALESFORCE_INSTANCE_URL}/services/data/v54.0/query/?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${context.SALESFORCE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.records[0] || null;
};
```

#### Custom Database Integration
```javascript
const lookupCustomerDatabase = async (phone_number) => {
  const db = runtime.getSync().mysql({
    host: context.DB_HOST,
    user: context.DB_USER,
    password: context.DB_PASSWORD,
    database: context.DB_NAME
  });
  
  const query = `
    SELECT c.*, ca.status, ca.last_visit
    FROM customers c
    LEFT JOIN customer_accounts ca ON c.id = ca.customer_id
    WHERE c.phone = ? OR c.mobile = ?
  `;
  
  const results = await db.query(query, [phone_number, phone_number]);
  return results[0] || null;
};
```

### Real-Time Data Enrichment

#### Studio Flow Integration
```javascript
// In Studio Flow Function widget
exports.handler = async (context, event, callback) => {
  const caller_number = event.From;
  
  // Lookup caller in multiple systems
  const [crmData, dbData, externalData] = await Promise.all([
    lookupCRM(caller_number),
    lookupDatabase(caller_number),
    lookupExternalAPI(caller_number)
  ]);
  
  // Combine and prioritize data
  const callerContext = {
    ...dbData,
    ...crmData,
    ...externalData,
    lookup_timestamp: new Date().toISOString()
  };
  
  // Return enriched attributes for TaskRouter
  callback(null, {
    caller_name: callerContext.name || 'Unknown',
    caller_email: callerContext.email,
    account_status: callerContext.status,
    vip_customer: callerContext.vip_status,
    last_interaction: callerContext.last_contact,
    preferred_agent: callerContext.preferred_agent
  });
};
```

#### Agent Screen Population
```javascript
// Flex plugin integration to display caller context
const CallerInfoPanel = ({ task }) => {
  const [callerData, setCallerData] = useState(null);
  
  useEffect(() => {
    if (task?.attributes?.caller_data) {
      setCallerData(JSON.parse(task.attributes.caller_data));
    }
  }, [task]);
  
  return (
    <div className="caller-info-panel">
      <h3>Caller Information</h3>
      {callerData && (
        <>
          <p><strong>Name:</strong> {callerData.name}</p>
          <p><strong>Account:</strong> {callerData.account_id}</p>
          <p><strong>Status:</strong> {callerData.status}</p>
          <p><strong>Last Contact:</strong> {callerData.last_contact}</p>
          {callerData.recent_orders && (
            <div>
              <strong>Recent Orders:</strong>
              <ul>
                {callerData.recent_orders.map(order => (
                  <li key={order.id}>{order.description} - {order.date}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

### External API Integrations

#### Payment Processing
```javascript
const checkPaymentStatus = async (customer_id) => {
  try {
    const response = await fetch(`${context.PAYMENT_API_URL}/customer/${customer_id}/status`, {
      headers: {
        'Authorization': `Bearer ${context.PAYMENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const paymentData = await response.json();
    return {
      outstanding_balance: paymentData.balance,
      last_payment: paymentData.last_payment_date,
      payment_method: paymentData.default_method,
      auto_pay_enabled: paymentData.auto_pay
    };
  } catch (error) {
    console.error('Payment lookup failed:', error);
    return null;
  }
};
```

#### Appointment Systems
```javascript
const checkAppointments = async (customer_id) => {
  const response = await fetch(`${context.APPOINTMENT_API_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${context.APPOINTMENT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customer_id: customer_id,
      status: ['scheduled', 'confirmed'],
      date_range: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Next 30 days
      }
    })
  });
  
  const appointments = await response.json();
  return appointments.data || [];
};
```

#### Inventory/Service Availability
```javascript
const checkServiceAvailability = async (service_type, location) => {
  const response = await fetch(`${context.INVENTORY_API_URL}/availability`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${context.INVENTORY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_type: service_type,
      location: location,
      date: new Date().toISOString().split('T')[0] // Today's date
    })
  });
  
  const availability = await response.json();
  return availability.available;
};
```

## Advanced Integration Patterns

### Multi-System Lookup Strategy
```javascript
const performComprehensiveLookup = async (phone_number) => {
  const lookupTasks = [
    { name: 'crm', fn: () => lookupCRM(phone_number), timeout: 3000 },
    { name: 'database', fn: () => lookupDatabase(phone_number), timeout: 2000 },
    { name: 'external', fn: () => lookupExternalAPI(phone_number), timeout: 5000 }
  ];
  
  const results = await Promise.allSettled(
    lookupTasks.map(async task => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), task.timeout)
      );
      
      return Promise.race([task.fn(), timeoutPromise]);
    })
  );
  
  const successfulLookups = {};
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulLookups[lookupTasks[index].name] = result.value;
    }
  });
  
  return consolidateData(successfulLookups);
};
```

### Caching Strategy
```javascript
const getCachedCallerData = async (phone_number) => {
  const cacheKey = `caller:${phone_number}`;
  const cached = await cache.get(cacheKey);
  
  if (cached && !isExpired(cached, 300)) { // 5 minute cache
    return cached.data;
  }
  
  const freshData = await performComprehensiveLookup(phone_number);
  await cache.set(cacheKey, {
    data: freshData,
    timestamp: Date.now()
  }, 3600); // 1 hour TTL
  
  return freshData;
};
```

### Fallback and Error Handling
```javascript
const robustLookup = async (phone_number) => {
  try {
    // Primary lookup method
    return await lookupPrimarySystem(phone_number);
  } catch (primaryError) {
    console.warn('Primary lookup failed:', primaryError);
    
    try {
      // Fallback to secondary system
      return await lookupSecondarySystem(phone_number);
    } catch (secondaryError) {
      console.warn('Secondary lookup failed:', secondaryError);
      
      // Return minimal data if all systems fail
      return {
        phone_number: phone_number,
        lookup_status: 'failed',
        timestamp: new Date().toISOString()
      };
    }
  }
};
```

## Webhook and Event Processing

### Real-time Updates
```javascript
// Webhook to receive updates from CRM
exports.crmWebhookHandler = async (context, event, callback) => {
  const { customer_id, phone_number, updated_fields } = event;
  
  // Update cached data
  await invalidateCache(`caller:${phone_number}`);
  
  // Notify active calls about data changes
  const activeCalls = await getActiveCallsForCustomer(customer_id);
  for (const call of activeCalls) {
    await updateTaskAttributes(call.task_sid, {
      customer_data_updated: true,
      updated_fields: updated_fields
    });
  }
  
  callback(null, 'Webhook processed');
};
```

### Automated Actions
```javascript
const triggerAutomatedActions = async (call_data) => {
  const { caller_info, call_type, duration } = call_data;
  
  // Log interaction in CRM
  if (caller_info.crm_id) {
    await createCRMActivity({
      contact_id: caller_info.crm_id,
      activity_type: 'phone_call',
      duration: duration,
      notes: `Inbound call to ${call_type} queue`,
      timestamp: new Date()
    });
  }
  
  // Update customer record
  if (caller_info.customer_id) {
    await updateCustomerRecord(caller_info.customer_id, {
      last_contact_date: new Date(),
      last_contact_type: 'phone',
      contact_count: caller_info.contact_count + 1
    });
  }
  
  // Trigger follow-up workflows
  if (call_data.needs_followup) {
    await createFollowupTask({
      customer_id: caller_info.customer_id,
      call_sid: call_data.sid,
      priority: caller_info.vip_status ? 'high' : 'normal'
    });
  }
};
```

## Security and Privacy

### Data Protection
```javascript
const sanitizeCallerData = (data) => {
  // Remove sensitive fields that shouldn't be in call attributes
  const sanitized = { ...data };
  delete sanitized.ssn;
  delete sanitized.credit_card;
  delete sanitized.password_hash;
  delete sanitized.bank_account;
  
  // Mask partial information
  if (sanitized.email) {
    sanitized.email = maskEmail(sanitized.email);
  }
  
  return sanitized;
};
```

### Access Control
```javascript
const filterDataByPermissions = (data, agent_permissions) => {
  const allowedFields = {
    basic: ['name', 'phone', 'email'],
    advanced: ['name', 'phone', 'email', 'address', 'account_balance'],
    admin: Object.keys(data) // All fields
  };
  
  const permitted = allowedFields[agent_permissions] || allowedFields.basic;
  
  return Object.keys(data)
    .filter(key => permitted.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});
};
```

### Audit Logging
```javascript
const logDataAccess = async (access_data) => {
  await auditLog.create({
    event_type: 'caller_data_lookup',
    user_id: access_data.agent_id,
    customer_phone: access_data.phone_number,
    data_sources: access_data.sources_used,
    fields_accessed: access_data.fields_returned,
    timestamp: new Date(),
    call_sid: access_data.call_sid
  });
};
```

## Performance Optimization

### Parallel Processing
```javascript
const optimizedLookup = async (phone_number) => {
  // Start all lookups simultaneously
  const lookupPromises = [
    lookupCRM(phone_number),
    lookupPayments(phone_number),
    lookupAppointments(phone_number)
  ];
  
  // Wait for the fastest essential lookup
  const crmData = await lookupPromises[0];
  
  // Continue with other lookups in background
  const [, paymentData, appointmentData] = await Promise.allSettled(lookupPromises);
  
  return {
    ...crmData,
    payment_info: paymentData.status === 'fulfilled' ? paymentData.value : null,
    appointments: appointmentData.status === 'fulfilled' ? appointmentData.value : []
  };
};
```

### Connection Pooling
```javascript
const createDatabasePool = () => {
  return mysql.createPool({
    host: context.DB_HOST,
    user: context.DB_USER,
    password: context.DB_PASSWORD,
    database: context.DB_NAME,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 3000,
    timeout: 5000
  });
};

// Reuse connections across function calls
const dbPool = createDatabasePool();
```

## Troubleshooting

### Common Issues

**Slow lookups affecting call routing**
- Implement timeout limits for external calls
- Use caching to reduce repeated lookups
- Consider async processing for non-critical data

**External API failures**
- Implement circuit breaker pattern
- Have fallback data sources
- Graceful degradation when services are down

**Data synchronization issues**
- Use webhooks for real-time updates
- Implement eventual consistency patterns
- Regular data validation and cleanup

### Monitoring and Alerting
```javascript
const monitorIntegrationHealth = async () => {
  const healthChecks = await Promise.allSettled([
    checkCRMHealth(),
    checkDatabaseHealth(),
    checkExternalAPIHealth()
  ]);
  
  healthChecks.forEach((check, index) => {
    const service = ['CRM', 'Database', 'External API'][index];
    if (check.status === 'rejected') {
      sendAlert({
        service: service,
        status: 'down',
        error: check.reason,
        timestamp: new Date()
      });
    }
  });
};
```

## Best Practices

### Integration Design
- Design for failures - always have fallbacks
- Implement proper timeouts and retries
- Use caching to improve performance
- Log all integration attempts for debugging

### Data Management
- Keep sensitive data in source systems
- Use data minimization principles
- Implement proper access controls
- Regular cleanup of cached data

### Performance
- Parallel processing where possible
- Connection pooling for databases
- Efficient caching strategies
- Monitor and optimize slow queries