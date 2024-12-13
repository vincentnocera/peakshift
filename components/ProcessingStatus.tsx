import { ProcessingStatus } from '@/types/concepts'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProcessingStatusIndicatorProps {
  status: ProcessingStatus
}

export default function ProcessingStatusIndicator({ status }: ProcessingStatusIndicatorProps) {
  if (status.stage === 'idle') return null

  const getStatusDisplay = () => {
    switch (status.stage) {
      case 'extracting-concepts':
        return {
          message: 'Extracting key concepts...',
          icon: <Loader2 className="h-4 w-4 animate-spin" />
        }
      case 'analyzing-concepts':
        return {
          message: `Analyzing concepts (${status.progress} of ${status.totalSteps})...`,
          icon: <Loader2 className="h-4 w-4 animate-spin" />
        }
      case 'review':
        return {
          message: 'Ready for review',
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        }
      case 'error':
        return {
          message: status.error || 'An error occurred',
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        }
      default:
        return {
          message: 'Processing...',
          icon: <Loader2 className="h-4 w-4 animate-spin" />
        }
    }
  }

  const { message, icon } = getStatusDisplay()

  return (
    <Alert>
      <div className="flex items-center gap-2">
        {icon}
        <AlertDescription>{message}</AlertDescription>
      </div>
      {status.stage === 'analyzing-concepts' && status.progress !== undefined && status.totalSteps && (
        <Progress 
          value={(status.progress / status.totalSteps) * 100} 
          className="mt-2"
        />
      )}
    </Alert>
  )
} 