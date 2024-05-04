import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Search } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import { IconButton } from "./icon-buttons";
import { Table } from "./table/table";
import { TableHeader } from "./table/table-header";
import { TableCell } from "./table/table-cell";
import { TableRow } from "./table/table-row";
import { ChangeEvent, useEffect, useState } from "react";

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

interface Attendee {
  id: string
  name: string
  email: string
  createdAt: string
  checkedInAt: string | null
}

export function AttendeeList() {

  const [search, setSearchInput] = useState(() => {
    const url = new URL(window.location.toString())
    if (url.searchParams.has('search')) {
      return url.searchParams.get('search') ?? ''
    }
    return ''
  })
  const [page, setPage] = useState(() => {
    const url = new URL(window.location.toString())
    if (url.searchParams.has('page')) {
      return Number(url.searchParams.get('page')) ?? 1
    }
    return 1
  })
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(attendees.length /10)

  useEffect(() => {
    const url = new URL('http://localhost:3333/events/10891b77-1075-4f54-a028-005df440e903/attendees')
    url.searchParams.set('pageIndex', String(page - 1))
    if (search.length > 0) {
      url.searchParams.set('query', search)
    }    
  
    return () => {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setAttendees(data.attendees)
          setTotal(data.total ?? 0)
        })
    }
  }, [page, search])
  
  function setCurrentSearch(search: string) {
    const url = new URL(window.location.toString())
    url.searchParams.set('search', search)

    window.history.pushState({}, "", url)

    setSearchInput(search)
  }

  function setCurrentPage(page: number) {
    const url = new URL(window.location.toString())
    url.searchParams.set('page', String(page))

    window.history.pushState({}, "", url)

    setPage(page)
  }
 
  function onSearchInputChanged(event: ChangeEvent<HTMLInputElement>): void {
    setCurrentSearch(event.target.value)
    setCurrentPage(1)
  }

  function goToNextPage(): void {
    setCurrentPage(page + 1)  
  }

  function goToPreviousPage(): void {
    if (page > 0) {
      setCurrentPage(page - 1)
    }
  }

  function goToLastPage(): void {
    setCurrentPage(totalPages)
  }

  function goToFirsPage(): void {
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center ">
        <h1 className="text-2xl font-bold">Participantes</h1>
        <div className="px-3 w-72 py-1.5 border border-white/10 rounded-lg flex items-center gap-3">
          <Search className="s-4 text-emerald-300" />
          <input 
            onChange={onSearchInputChanged} 
            className="bg-transparent flex-1 outline-none border-0 p-0 text-sm focus:ring-0" 
            placeholder="Buscar participantes" 
            value={search}
          />
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <TableHeader style={{ width: 48 }}>
              <input type="checkbox" className="size-4 bg-black/20 rounded border border-white/10" />
            </TableHeader>
            <TableHeader >Código</TableHeader>
            <TableHeader >Participantes</TableHeader>
            <TableHeader >Data de inscriçáo</TableHeader>
            <TableHeader >Data de check-in</TableHeader>
            <TableHeader style={{ width: 64 }} ></TableHeader>
          </tr>  
        </thead>
        <tbody>
          {attendees.map((attendee) => {
            return ( 
              <TableRow key={attendee.id}>
                <TableCell>
                  <input type="checkbox" className="size-4 bg-black/20 rounded border border-white/10 accent-orange-400" />
                </TableCell>
                <TableCell>{attendee.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white">{attendee.name}</span>
                    <span>{attendee.email}</span>
                  </div>
                </TableCell>
                <TableCell>{dayjs().to(attendee.createdAt)}</TableCell>
                <TableCell>
                  {attendee.checkedInAt === null 
                    ? <span className="text-zinc-400">Não fez check-in</span>
                    : dayjs().to(attendee.checkedInAt)}
                </TableCell>
                <TableCell>
                  <IconButton transparent>
                    <MoreHorizontal className="size-4"/>
                  </IconButton>
                </TableCell>
              </TableRow>
            )})}
        </tbody>
        <tfoot>
          <tr>
            <TableCell colSpan={3}>
              Mostrando {attendees.length} de {total} itens
            </TableCell>
            <TableCell className="text-right" colSpan={3}>
              <div className="inline-flex items-center gap-8">
                <span>Pagina {page} de {totalPages}</span>
                
                <div className="flex gap-1.5">
                  <IconButton onClick={goToFirsPage} disabled={page === 1}>
                    <ChevronsLeft className="size-4"/>
                  </IconButton>
                  <IconButton onClick={goToPreviousPage} disabled={page === 1}>
                    <ChevronLeft className="size-4"/>
                  </IconButton>
                  <IconButton onClick={goToNextPage} disabled={page === totalPages}>
                    <ChevronRight className="size-4"/>
                  </IconButton>
                  <IconButton onClick={goToLastPage} disabled={page === totalPages}>
                    <ChevronsRight className="size-4"/>
                  </IconButton>
                </div>
              </div>
            </TableCell>
          </tr>
        </tfoot>
      </Table>
    </div>
  )
} 