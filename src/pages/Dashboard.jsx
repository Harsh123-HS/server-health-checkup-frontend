import React from 'react'
import StatusBadge from '../components/StatusBadge'
import ServerTable from '../components/ServerTable'

function Dashboard() {
  return (
    <>
    <div className='min-h-screen bg-[#0f172a] '>
        <StatusBadge/>
        <ServerTable/>
    </div>
    </>
  )
}

export default Dashboard