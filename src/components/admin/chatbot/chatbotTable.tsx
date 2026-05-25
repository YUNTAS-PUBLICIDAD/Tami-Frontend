<<<<<<< HEAD
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table'
import { Button } from 'src/components/ui/button'
import IconUploader from './IconUploader'
import GenericModal from '../ui/GenericModal'
import ChatbotIcon from 'src/components/ui/chatbot/ChatbotIcon'

const chatbotTable = () => {
  const [iconModalVisible, setIconModalVisible]=useState(false);

  return (

        <div className="container mx-auto max-w-6xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold flex items-center gap-2 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M6 20n 4-4V6a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
                    </svg>
                    <span>Gestión de Chatbot</span>
                  </h2>
                  <p className="text-teal-50 mt-2 text-base md:text-lg">
                    Configura el comportamiento del chatbot
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <ChatbotIcon/>
                  <button onClick={()=>setIconModalVisible(true) } className="bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-teal-800 flex items-center justify-center gap-2 text-sm transition-all">
                    <span className="text-lg leading-none">+</span> Cambiar Logo
                  </button>
                </div>
              </div>
            </div>


            <div className="overflow-x-auto">
              <Table className="w-full text-left border-collapse">
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <TableHead className="p-4 pl-8 font-bold tracking-wide uppercase text-xs text-gray-500">Col1</TableHead>
                    <TableHead className="p-4 font-bold tracking-wide uppercase text-xs text-gray-500">Col2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  
                  <TableRow className="hover:bg-gray-50/70 transition-colors">
                    <TableCell className="p-4 font-semibold  ">SELLADORA DE BOTELLAS</TableCell>
                    <TableCell className="p-4">
                      <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-xs font-semibold capitalize">
                        Trabajo
                      </span>
                    </TableCell>

                  </TableRow>

                  <TableRow>
                    <TableCell className="p-4 font-semibold  ">MÁQUINA DE EMBALAJE</TableCell>
                    <TableCell className="p-4">
                      <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-xs font-semibold capitalize">
                        Trabajo
                      </span>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="p-4 font-semibold  ">SELLADORA DE BOLSAS</TableCell>
                    <TableCell className="p-4">
                      <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-xs font-semibold capitalize">
                        Trabajo
                      </span>
                    </TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-gray-50/70 transition-colors">
                    <TableCell className="p-4 font-semibold  ">SELLADORA DE BOLSAS DE CHIFLES</TableCell>
                    <TableCell className="p-4">
                      <span className="bg-cyan-100 text-cyan-800 py-1 px-3 rounded-full text-xs font-semibold capitalize">
                        Decoracion
                      </span>
                    </TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </div>
            <GenericModal isOpen={iconModalVisible} title='Icono de Chatbot' onClose={()=>setIconModalVisible(false)}>
              <IconUploader/>
            </GenericModal>
          </div>
        </div>
      
=======
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table'

const chatbotTable = () => {
  return (
    <div>
        <Table>
          <TableHeader>
            <TableRow>
              CHATBOT
            </TableRow>
          </TableHeader>

          <TableBody>
          <TableRow>
              CHATBOT
            </TableRow>
          </TableBody>
        </Table>
      
    </div>
>>>>>>> origin/pre-main
  )
}

export default chatbotTable
