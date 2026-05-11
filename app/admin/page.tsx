import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import AdminActions from './AdminActions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/')
  }

  const [pendingSightings, pendingDisputes, recentCases] = await Promise.all([
    prisma.sighting.findMany({
      where: { isApproved: false, isRemoved: false },
      include: { case: { select: { accusedName: true, slug: true } }, submittedBy: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.dispute.findMany({
      where: { status: 'PENDING' },
      include: { case: { select: { accusedName: true, slug: true } }, filedBy: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        accusedName: true,
        cnrNumber: true,
        slug: true,
        status: true,
        createdAt: true,
        isVerified: true,
      },
    }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <Tabs defaultValue="sightings">
        <TabsList className="mb-6">
          <TabsTrigger value="sightings">
            Sightings ({pendingSightings.length})
          </TabsTrigger>
          <TabsTrigger value="disputes">
            Disputes ({pendingDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
        </TabsList>

        {/* Moderation queue: sightings */}
        <TabsContent value="sightings">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>Submitted by</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSightings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No pending sightings
                  </TableCell>
                </TableRow>
              )}
              {pendingSightings.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/case/${s.case.slug}`} className="text-blue-600 hover:underline text-sm">
                      {s.case.accusedName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{s.submittedBy.email}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{s.description}</TableCell>
                  <TableCell>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View source
                    </a>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {new Intl.DateTimeFormat('en-IN', { dateStyle: 'short' }).format(new Date(s.createdAt))}
                  </TableCell>
                  <TableCell>
                    <AdminActions type="sighting" id={s.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Disputes */}
        <TabsContent value="disputes">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>Filed by</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDisputes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No pending disputes
                  </TableCell>
                </TableRow>
              )}
              {pendingDisputes.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link href={`/case/${d.case.slug}`} className="text-blue-600 hover:underline text-sm">
                      {d.case.accusedName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{d.filedBy.email}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                      {d.reason}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{d.description}</TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {new Intl.DateTimeFormat('en-IN', { dateStyle: 'short' }).format(new Date(d.createdAt))}
                  </TableCell>
                  <TableCell>
                    <AdminActions type="dispute" id={d.id} caseId={d.caseId} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* All cases */}
        <TabsContent value="cases">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accused</TableHead>
                <TableHead>CNR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Filed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/case/${c.slug}`} className="text-blue-600 hover:underline">
                      {c.accusedName}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.cnrNumber}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.isVerified ? '✅' : '❌'}
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {new Intl.DateTimeFormat('en-IN', { dateStyle: 'short' }).format(new Date(c.createdAt))}
                  </TableCell>
                  <TableCell>
                    <AdminActions type="case" id={c.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
