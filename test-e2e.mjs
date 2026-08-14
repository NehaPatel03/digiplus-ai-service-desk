async function runE2ETest() {
  console.log('🚀 Starting DigiPlus AI Service Desk End-to-End Verification...\n');
  const baseUrl = 'http://localhost:3000';

  // 1. Test Dashboard Stats
  console.log('1️⃣ Testing Dashboard Statistics API (/api/stats)...');
  const statsRes = await fetch(`${baseUrl}/api/stats`);
  const statsData = await statsRes.json();
  console.log('Stats Response:', JSON.stringify(statsData.data, null, 2));
  if (!statsData.success) throw new Error('Stats API failed');
  console.log('✅ Dashboard Stats OK!\n');

  // 2. Test Listing Initial Tickets
  console.log('2️⃣ Testing Tickets List API (/api/tickets)...');
  const ticketsRes = await fetch(`${baseUrl}/api/tickets`);
  const ticketsData = await ticketsRes.json();
  console.log(`Retrieved ${ticketsData.count} tickets.`);
  if (!ticketsData.success || ticketsData.count === 0) throw new Error('Tickets listing failed');
  console.log('✅ Tickets List OK!\n');

  // 3. Test Knowledge Base
  console.log('3️⃣ Testing Knowledge Base API (/api/knowledge-base)...');
  const kbRes = await fetch(`${baseUrl}/api/knowledge-base`);
  const kbData = await kbRes.json();
  console.log(`Retrieved ${kbData.count} knowledge base articles.`);
  if (!kbData.success || kbData.count === 0) throw new Error('Knowledge base listing failed');
  console.log('✅ Knowledge Base OK!\n');

  // 4. Test Create Ticket
  console.log('4️⃣ Testing Ticket Creation (/api/tickets)...');
  const newTicketPayload = {
    title: 'PostgreSQL RDS connection pool exhausted during peak billing batch',
    description: 'During the 2AM billing job, clients receive 500 Internal Server Error. Backend logs report: Connection pool exhausted (100/100 active connections). Postgres CPU at 95%.',
    priority: 'Urgent',
    category: 'Cloud & Infrastructure'
  };
  const createRes = await fetch(`${baseUrl}/api/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTicketPayload)
  });
  const createdData = await createRes.json();
  console.log('Created Ticket:', createdData.data);
  if (!createdData.success || !createdData.data?.id) throw new Error('Ticket creation failed');
  const ticketId = createdData.data.id;
  console.log(`✅ Ticket #${ticketId} Created Successfully!\n`);

  // 5. Test AI Analysis
  console.log(`5️⃣ Testing AI Ticket Analysis (/api/ai/analyze for Ticket #${ticketId})...`);
  const aiRes = await fetch(`${baseUrl}/api/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId })
  });
  const aiData = await aiRes.json();
  console.log('AI Analysis Result:', JSON.stringify(aiData.data.analysis, null, 2));
  console.log('Matched KB Articles:', aiData.data.relevantArticles?.map((a) => a.title));
  if (!aiData.success || !aiData.data.analysis.summary) throw new Error('AI analysis failed');
  console.log('✅ AI Analysis & Knowledge Runbook Matching OK!\n');

  // 6. Test Updating Status & Resolution (Lifecycle)
  console.log(`6️⃣ Testing Ticket Resolution (/api/tickets/${ticketId})...`);
  const resolutionNotes = `[Verified & Resolved]\n1. Terminated locking long-running billing aggregation query via pg_terminate_backend.\n2. Increased RDS max_connections and configured PgBouncer pool_size=50.\n3. Verified application throughput restored to normal.`;
  const resolveRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resolution: resolutionNotes,
      status: 'Resolved'
    })
  });
  const resolvedData = await resolveRes.json();
  console.log('Resolved Ticket Record:', resolvedData.data);
  if (!resolvedData.success || resolvedData.data.status !== 'Resolved') throw new Error('Ticket resolution failed');
  console.log('✅ Ticket Resolution Persisted!\n');

  // 7. Verify Updated Dashboard Stats
  console.log('7️⃣ Verifying Updated Dashboard Stats after ticket creation & resolution...');
  const updatedStatsRes = await fetch(`${baseUrl}/api/stats`);
  const updatedStats = await updatedStatsRes.json();
  console.log('Updated Stats:', JSON.stringify(updatedStats.data, null, 2));
  if (updatedStats.data.totalTickets <= statsData.data.totalTickets) {
    throw new Error('Total tickets count did not increment');
  }
  console.log('✅ Dashboard Stats Updated Accurately!\n');

  // 8. Verify HTML Page Renders
  console.log('8️⃣ Verifying HTML Page Renders (SSR / Client Pages)...');
  const pages = ['/', '/tickets', `/tickets/${ticketId}`, '/knowledge-base'];
  for (const page of pages) {
    const pageRes = await fetch(`${baseUrl}${page}`);
    if (!pageRes.ok) throw new Error(`Page ${page} returned status ${pageRes.status}`);
    console.log(`   - ${page} => HTTP ${pageRes.status} OK`);
  }

  console.log('\n🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! 🚀');
}

runE2ETest().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
