import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

export default function TournamentSection({
  data,
}: {
  data: {
    total_tournaments: number
    itm_percent: number
    final_table_percent: number
    win_percent: number
  }
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>ITM Rate</span>
          <span>{data.itm_percent}%</span>
        </div>
        <div className="flex justify-between">
          <span>Final Table</span>
          <span>{data.final_table_percent}%</span>
        </div>
        <div className="flex justify-between">
          <span>Win Rate</span>
          <span>{data.win_percent}%</span>
        </div>
        <div className="flex justify-between">
          <span>Total Tournaments</span>
          <span>{data.total_tournaments}</span>
        </div>
      </CardContent>
    </Card>
  )
}
