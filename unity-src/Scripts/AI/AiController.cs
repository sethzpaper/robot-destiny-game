// AI logic is embedded in GameManager.RunAiTurn() coroutine.
// This file is reserved for future advanced AI (e.g. priority-scoring, lookahead).
//
// To extend AI: override RunAiTurn() or inject an IAiStrategy before GameManager calls it.

namespace SteelRobotDestiny
{
    public interface IAiStrategy
    {
        System.Collections.IEnumerator Execute(GameManager gm);
    }
}
